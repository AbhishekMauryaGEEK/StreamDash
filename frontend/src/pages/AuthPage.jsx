import React, { useState } from 'react';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { Youtube, Mail, Lock, User, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';

export default function AuthPage() {
    // Views: "login", "register", "forgot", "reset"
    const [view, setView] = useState("login"); 
    const [loading, setLoading] = useState(false);
    const { checkLoggedIn } = useAuth();

    // Form States
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullname: '',
        password: ''
    });
    const [avatar, setAvatar] = useState(null);
    
    // Password Reset States
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (view === "login") {
                await api.post('/users/login', {
                    email: formData.email,
                    password: formData.password
                });
                await checkLoggedIn();
            } else {
                const data = new FormData();
                data.append("username", formData.username);
                data.append("email", formData.email);
                data.append("password", formData.password);
                data.append("fullname", formData.fullname);
                if (avatar) data.append("avatar", avatar);

                await api.post('/users/register', data);
                alert("Registration successful! Please Sign In.");
                setView("login");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleForgetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Backend uses the 'email' field to find user and send OTP
            await api.post('/users/forget-password', { email: formData.email });
            alert("OTP sent to your email!");
            setView("reset");
        } catch (err) {
            alert(err.response?.data?.message || "Error sending email");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return alert("Passwords don't match");

        setLoading(true);
        try {
            await api.post('/users/reset-password', {
                email: formData.email,
                otp,
                newPassword,
                confirmPassword
            });
            alert("Password reset successfully!");
            setView("login");
        } catch (err) {
            alert(err.response?.data?.message || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-white font-sans">
            <div className="glass w-full max-w-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl bg-[#121212]">
                
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-primary/10 rounded-2xl mb-3">
                        <Youtube className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">
                        {view === "login" && "Welcome Back"}
                        {view === "register" && "Create Account"}
                        {view === "forgot" && "Reset Password"}
                        {view === "reset" && "Verify OTP"}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {view === "forgot" ? "We'll send a code to your email" : "Join the StreamDash community"}
                    </p>
                </div>

                {/* Main Auth Form (Login/Register) */}
                {(view === "login" || view === "register") && (
                    <form onSubmit={handleAuth} className="space-y-4">
                        {view === "register" && (
                            <>
                                <div className="relative">
                                    <input
                                        type="text" placeholder="Full Name" required
                                        className="w-full p-4 pl-12 bg-surface border border-border rounded-2xl outline-none focus:border-primary/50 transition-all"
                                        onChange={e => setFormData({ ...formData, fullname: e.target.value })}
                                    />
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                </div>
                                <div className="relative">
                                    <input
                                        type="text" placeholder="Username" required
                                        className="w-full p-4 pl-12 bg-surface border border-border rounded-2xl outline-none focus:border-primary/50 transition-all"
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold">@</span>
                                </div>
                            </>
                        )}
                        <div className="relative">
                            <input
                                type="email" placeholder="Email Address" required
                                className="w-full p-4 pl-12 bg-surface border border-border rounded-2xl outline-none focus:border-primary/50 transition-all"
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                        </div>
                        <div className="relative">
                            <input
                                type="password" placeholder="Password" required
                                className="w-full p-4 pl-12 bg-surface border border-border rounded-2xl outline-none focus:border-primary/50 transition-all"
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                        </div>

                        {view === "register" && (
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 ml-1">Upload Profile Avatar</label>
                                <input type="file" accept="image/*" required onChange={e => setAvatar(e.target.files[0])} 
                                className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="w-full bg-primary py-4 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-primary/20 flex justify-center items-center gap-2 mt-4">
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (view === "login" ? 'Sign In' : 'Get Started')}
                        </button>

                        {view === "login" && (
                            <button 
                                type="button" 
                                onClick={() => setView("forgot")}
                                className="w-full text-center text-sm text-gray-500 hover:text-white transition-colors"
                            >
                                Forgot Password?
                            </button>
                        )}
                    </form>
                )}

                {/* Forgot Password View */}
                {view === "forgot" && (
                    <form onSubmit={handleForgetPassword} className="space-y-4">
                        <div className="relative">
                            <input
                                type="email" placeholder="Registered Email" required
                                className="w-full p-4 pl-12 bg-surface border border-border rounded-2xl outline-none focus:border-primary/50"
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-primary py-4 rounded-2xl font-bold flex justify-center items-center gap-2">
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send Reset Code'}
                        </button>
                        <button type="button" onClick={() => setView("login")} className="w-full flex items-center justify-center gap-2 text-sm text-gray-500">
                            <ArrowLeft size={16} /> Back to Login
                        </button>
                    </form>
                )}

                {/* Reset Password View (OTP) */}
                {view === "reset" && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="relative">
                            <input
                                type="text" placeholder="6-digit Code" required
                                className="w-full p-4 pl-12 bg-surface border border-border rounded-2xl outline-none focus:border-primary/50"
                                onChange={e => setOtp(e.target.value)}
                            />
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                        </div>
                        <input
                            type="password" placeholder="New Password" required
                            className="w-full p-4 bg-surface border border-border rounded-2xl outline-none focus:border-primary/50"
                            onChange={e => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password" placeholder="Confirm New Password" required
                            className="w-full p-4 bg-surface border border-border rounded-2xl outline-none focus:border-primary/50"
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                        <button type="submit" disabled={loading} className="w-full bg-primary py-4 rounded-2xl font-bold">
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Update Password'}
                        </button>
                    </form>
                )}

                {/* Footer Toggle */}
                {(view === "login" || view === "register") && (
                    <button 
                        onClick={() => setView(view === "login" ? "register" : "login")} 
                        className="w-full mt-8 text-gray-500 text-sm hover:text-white transition-colors"
                    >
                        {view === "login" ? "Need an account? Register" : "Already have an account? Login"}
                    </button>
                )}
            </div>
        </div>
    );
}