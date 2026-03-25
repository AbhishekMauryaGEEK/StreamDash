import React, { useState } from 'react';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { Youtube, User, Mail, Lock, Image as ImageIcon } from 'lucide-react';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const { checkLoggedIn } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullname: '',
        password: ''
    });
    const [avatar, setAvatar] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await api.post('/users/login', {
                    email: formData.email,
                    password: formData.password
                });
                
                // FIX: Await the context update. 
                // App.jsx will automatically destroy this page and load the Dashboard.
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
                setIsLogin(true);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-white">
            <div className="glass w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <Youtube className="w-12 h-12 text-primary mb-2" />
                    <h1 className="text-3xl font-bold">{isLogin ? 'Welcome Back' : 'Join Us'}</h1>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <>
                            <input 
                                type="text" placeholder="Full Name" required
                                className="w-full p-4 bg-surface border border-border rounded-xl outline-none focus:border-primary/50"
                                onChange={e => setFormData({...formData, fullname: e.target.value})}
                            />
                            <input 
                                type="text" placeholder="Username" required
                                className="w-full p-4 bg-surface border border-border rounded-xl outline-none focus:border-primary/50"
                                onChange={e => setFormData({...formData, username: e.target.value})}
                            />
                        </>
                    )}
                    <input 
                        type="email" placeholder="Email" required
                        className="w-full p-4 bg-surface border border-border rounded-xl outline-none focus:border-primary/50"
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                    <input 
                        type="password" placeholder="Password" required
                        className="w-full p-4 bg-surface border border-border rounded-xl outline-none focus:border-primary/50"
                        onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                    {!isLogin && (
                        <input type="file" accept="image/*" required onChange={e => setAvatar(e.target.files[0])} className="text-sm" />
                    )}
                    <button type="submit" disabled={loading} className="w-full bg-primary py-4 rounded-xl font-bold hover:bg-red-600 transition-all">
                        {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register'}
                    </button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-gray-400 text-sm hover:text-white">
                    {isLogin ? "Need an account? Register" : "Have an account? Login"}
                </button>
            </div>
        </div>
    );
}