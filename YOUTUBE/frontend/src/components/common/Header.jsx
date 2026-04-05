import React, { useState, useRef, useEffect } from 'react';
import { Search, Upload, User, LogOut, Settings, Edit3, ChevronDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';

export default function Header({ onOpenUpload }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, setUser } = useAuth(); // Grab real-time user data
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/users/logout');
            setUser(null); // Clear context
            navigate('/auth');
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <header className="h-16 w-full glass border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl hidden sm:flex items-center bg-surface border border-border rounded-full px-4 py-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search..." className="w-full bg-transparent outline-none px-3" />
            </div>

            <div className="flex items-center gap-4 ml-auto">
                <button
                    onClick={onOpenUpload}
                    className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-600 transition-colors font-semibold"
                >
                    <Upload className="w-4 h-4" /> Upload
                </button>

                {/* Profile Dropdown Container */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 p-1 hover:bg-white/5 rounded-full transition-colors"
                    >
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt="Profile"
                                className="w-9 h-9 rounded-full object-cover border border-white/10"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                        )}
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu - Fixed UI */}
                    {isProfileOpen && (
                        <div
                            className="absolute right-0 mt-3 w-64 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-3 z-50 border border-white/10 animate-in fade-in zoom-in duration-200"
                            style={{
                                backgroundColor: '#121212',
                                backdropFilter: 'blur(20px)'
                            }}
                        >
                            {/* User Info Header */}
                            <div className="px-5 py-3 border-b border-white/5 mb-2">
                                <p className="text-sm font-bold text-white truncate">{user?.fullname || 'User'}</p>
                                <p className="text-xs text-primary font-medium truncate">@{user?.username}</p>
                            </div>

                            <div className="space-y-1 px-2">
                                {/* 🚀 NEW: View Channel Link */}
                                <Link
                                    to={`/c/${user?.username}`}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group text-sm text-gray-300 hover:text-white"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <User className="w-4 h-4 text-gray-500 group-hover:text-primary" />
                                    <span>View your channel</span>
                                </Link>

                                <Link
                                    to="/profile"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group text-sm text-gray-300 hover:text-white"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Edit3 className="w-4 h-4 text-gray-500 group-hover:text-primary" />
                                    <span>Edit Profile</span>
                                </Link>

                                <Link
                                    to="/settings"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group text-sm text-gray-300 hover:text-white"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Settings className="w-4 h-4 text-gray-500 group-hover:text-primary" />
                                    <span>Settings</span>
                                </Link>

                                <div className="h-px bg-white/5 my-1 mx-2" /> {/* Divider */}

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all group text-sm text-red-500 font-semibold"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}