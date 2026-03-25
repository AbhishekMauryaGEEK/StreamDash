import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { Camera, Save, Key, User as UserIcon } from 'lucide-react';

export default function UserProfile() {
    const { user, checkLoggedIn } = useAuth();
    
    // Use 'fullname' (lowercase) to match your backend object
    const [fullname, setFullname] = useState(user?.fullname || "");
    const [email, setEmail] = useState(user?.email || "");

    // Sync state if user data loads late
    useEffect(() => {
        if (user) {
            setFullname(user.fullname || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        try {
            // FIX: Sending 'fullname' key to match backend controller
            await api.patch('/users/update-account', { fullname, email });
            alert("Profile updated successfully!");
            await checkLoggedIn(); 
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            await api.patch('/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Avatar updated!");
            await checkLoggedIn();
        } catch (err) {
            alert("Avatar update failed");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8 text-white">
            <h1 className="text-3xl font-bold border-b border-white/10 pb-4">Account Settings</h1>

            <div className="glass p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                    <img 
                        src={user?.avatar || 'https://via.placeholder.com/150'} 
                        alt="avatar" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary/20" 
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                        <Camera className="text-white" />
                        <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                    </label>
                </div>
                <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-bold text-primary">@{user?.username}</h2>
                    <p className="text-gray-400 italic">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <form onSubmit={handleUpdateDetails} className="glass p-8 rounded-3xl space-y-6">
                <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
                    <UserIcon size={20} /> <span>Personal Information</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">Full Name</label>
                        <input 
                            type="text" value={fullname} onChange={(e) => setFullname(e.target.value)}
                            placeholder="Full Name" className="w-full p-4 bg-surface border border-border rounded-xl text-white outline-none focus:border-primary/40"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">Email Address</label>
                        <input 
                            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address" className="w-full p-4 bg-surface border border-border rounded-xl text-white outline-none focus:border-primary/40"
                        />
                    </div>
                </div>
                <button type="submit" className="flex items-center gap-2 bg-primary px-8 py-4 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-primary/20">
                    <Save size={18} /> Save Changes
                </button>
            </form>
        </div>
    );
}