import React, { useState } from 'react';
import api from '../utils/axios';
import { ShieldCheck, Key, RefreshCcw, Loader2 } from 'lucide-react';

export default function Settings() {
    const [passwords, setPasswords] = useState({ oldpassword: "", newpassword: "", confpassword: "" });
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newpassword !== passwords.confpassword) return alert("Passwords don't match");
        
        setLoading(true);
        try {
            await api.patch('/users/change-password', passwords);
            alert("Password updated successfully!");
            setPasswords({ oldpassword: "", newpassword: "", confpassword: "" });
        } catch (err) {
            alert(err.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshSession = async () => {
        try {
            await api.post('/users/refresh-token');
            alert("Session refreshed successfully!");
        } catch (err) {
            alert("Failed to refresh session");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-10 space-y-8 text-white">
            <h1 className="text-3xl font-bold">Security Settings</h1>

            {/* Change Password Card */}
            <form onSubmit={handleChangePassword} className="bg-[#121212] border border-white/5 p-8 rounded-[2rem] space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <Key className="text-primary w-5 h-5" />
                    <h3 className="text-xl font-bold">Update Password</h3>
                </div>

                <div className="space-y-4">
                    <input 
                        type="password" placeholder="Old Password" required
                        className="w-full p-4 bg-[#0a0a0a] border border-white/10 rounded-xl outline-none focus:border-primary"
                        onChange={(e) => setPasswords({...passwords, oldpassword: e.target.value})}
                    />
                    <input 
                        type="password" placeholder="New Password" required
                        className="w-full p-4 bg-[#0a0a0a] border border-white/10 rounded-xl outline-none focus:border-primary"
                        onChange={(e) => setPasswords({...passwords, newpassword: e.target.value})}
                    />
                    <input 
                        type="password" placeholder="Confirm New Password" required
                        className="w-full p-4 bg-[#0a0a0a] border border-white/10 rounded-xl outline-none focus:border-primary"
                        onChange={(e) => setPasswords({...passwords, confpassword: e.target.value})}
                    />
                </div>

                <button type="submit" disabled={loading} className="bg-primary px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center gap-2">
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Update Password"}
                </button>
            </form>

            {/* Session Token Refresh */}
            <div className="bg-[#121212] border border-white/5 p-8 rounded-[2rem] flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl"><RefreshCcw className="text-blue-500" /></div>
                    <div>
                        <p className="font-bold">Session Token</p>
                        <p className="text-sm text-gray-400">Manually refresh your access token for security.</p>
                    </div>
                </div>
                <button onClick={handleRefreshSession} className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition-all">
                    Refresh Token
                </button>
            </div>
        </div>
    );
}