import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { Camera, Save, User as UserIcon, Mail, Loader2, ShieldCheck } from 'lucide-react';

export default function UserProfile() {
    const { user, checkLoggedIn } = useAuth();
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFullname(user.fullname || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch('/users/update-account', { fullname, email });
            await checkLoggedIn();
            alert("Profile updated successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
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
            await checkLoggedIn();
            alert("Avatar updated!");
        } catch (err) {
            alert("Avatar update failed");
        }
    };
    const handleCoverChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("coverImage", file); 

        try {
            await api.patch('/users/update-cover-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await checkLoggedIn();
            alert("Cover image updated!");
        } catch (err) {
            alert("Failed to update cover image");
        }
    };
    return (
        <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-10 text-white animate-in fade-in duration-500">
            <header className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">Account Settings</h1>
                <p className="text-gray-400">Manage your public profile and account security.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: cover Card */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-400">Profile Banner</label>
                    <div className="relative h-32 w-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden group">
                        {user?.coverImage && <img src={user.coverImage} className="w-full h-full object-cover opacity-50" />}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                            <Camera className="w-6 h-6 text-white" />
                            <input type="file" className="hidden" onChange={handleCoverChange} accept="image/*" />
                        </label>
                    </div>
                </div>
                {/* Left Column: Avatar Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass bg-[#121212] border border-white/5 rounded-[2rem] p-8 flex flex-col items-center text-center shadow-2xl">
                        <div className="relative group mb-6">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20 ring-8 ring-black/20 group-hover:ring-primary/10 transition-all duration-500">
                                <img
                                    src={user?.avatar || 'https://via.placeholder.com/150'}
                                    alt="avatar"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all duration-300 backdrop-blur-sm">
                                <Camera className="text-white w-8 h-8" />
                                <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                            </label>
                        </div>
                        <h2 className="text-2xl font-bold">@{user?.username}</h2>
                        <span className="mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20 uppercase tracking-widest">
                            Pro Member
                        </span>
                    </div>
                </div>

                {/* Right Column: Form Card */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleUpdateDetails} className="glass bg-[#121212] border border-white/5 rounded-[2rem] p-8 md:p-10 shadow-2xl space-y-8">
                        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <UserIcon className="text-primary w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold">Personal Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                    Full Name
                                </label>
                                <input
                                    type="text" value={fullname} onChange={(e) => setFullname(e.target.value)}
                                    className="w-full p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-400">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none pl-12"
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto flex items-center justify-center gap-3 bg-primary px-12 py-4 rounded-2xl font-bold hover:bg-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={20} />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}