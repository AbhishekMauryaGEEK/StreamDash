import React, { useState, useRef, useEffect } from 'react';
import { Search, Upload, User, LogOut, Settings, Edit3, ChevronDown, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';

export default function Header({ onOpenUpload }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); // 🔍 NEW: Local state for search
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // 🚀 Handle Search Execution
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/?query=${searchTerm.trim()}`);
        }
    };

    // 🚀 Clear Search
    const clearSearch = () => {
        setSearchTerm("");
        navigate("/");
    };

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
            setUser(null);
            navigate('/auth');
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <header className="h-16 w-full glass border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
            
            {/* 🔍 UPDATED: Search Bar Logic */}
            <form 
                onSubmit={handleSearch}
                className="flex-1 max-w-2xl hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 focus-within:border-primary/50 focus-within:bg-white/10 transition-all group"
            >
                <Search className="w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search the grid..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent outline-none px-3 text-sm text-white placeholder:text-gray-600" 
                />
                {searchTerm && (
                    <button type="button" onClick={clearSearch}>
                        <X className="w-4 h-4 text-gray-500 hover:text-white" />
                    </button>
                )}
            </form>

            <div className="flex items-center gap-4 ml-auto">
                <button
                    onClick={onOpenUpload}
                    className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-600 transition-all hover:scale-105 active:scale-95 font-black italic uppercase text-xs tracking-widest shadow-lg shadow-primary/20"
                >
                    <Upload className="w-4 h-4" /> Upload
                </button>

                {/* Profile Dropdown Container */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 p-1 hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-white/10"
                    >
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt="Profile"
                                className="w-9 h-9 rounded-full object-cover border border-white/10 shadow-xl"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-400" />
                            </div>
                        )}
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div
                            className="absolute right-0 mt-3 w-64 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-3 z-50 border border-white/10 animate-in fade-in zoom-in-95 duration-200"
                            style={{
                                backgroundColor: '#0f0f0f',
                                backdropFilter: 'blur(20px)'
                            }}
                        >
                            <div className="px-5 py-3 border-b border-white/5 mb-2">
                                <p className="text-sm font-black text-white truncate uppercase tracking-tighter italic">{user?.fullname || 'User'}</p>
                                <p className="text-[10px] text-primary font-bold truncate tracking-widest uppercase">@{user?.username}</p>
                            </div>

                            <div className="space-y-1 px-2">
                                <Link
                                    to={`/c/${user?.username}`}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group text-sm text-gray-300 hover:text-white"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <User className="w-4 h-4 text-gray-500 group-hover:text-primary" />
                                    <span className="font-bold">View your channel</span>
                                </Link>

                                <Link
                                    to="/profile"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group text-sm text-gray-300 hover:text-white"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Edit3 className="w-4 h-4 text-gray-500 group-hover:text-primary" />
                                    <span className="font-bold">Edit Profile</span>
                                </Link>

                                <Link
                                    to="/settings"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group text-sm text-gray-300 hover:text-white"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Settings className="w-4 h-4 text-gray-500 group-hover:text-primary" />
                                    <span className="font-bold">Settings</span>
                                </Link>

                                <div className="h-px bg-white/5 my-1 mx-2" />

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all group text-sm text-red-500 font-black uppercase tracking-widest italic"
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