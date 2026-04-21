import React from 'react';
import { Home, PlaySquare, Youtube, BarChart3, Settings, Users, ListMusic } from 'lucide-react'; 
import { NavLink } from 'react-router-dom';

// ❌ REMOVED: import { Playlist } from '../../../../backend/src/models/playlist.model.js';

const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Playlists', icon: ListMusic, path: '/playlists' }, // ✅ Fixed typo & icon
    { name: 'Following', icon: Users, path: '/following' }, 
    { name: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-16 md:w-64 glass border-r border-white/5 z-40 flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <Youtube className="w-8 h-8 text-primary" />
                <span className="hidden md:block ml-3 text-xl font-bold tracking-tighter">StreamDash</span>
            </div>
            <nav className="flex-1 py-6 px-3 space-y-2">
                {navItems.map((item) => (
                    <NavLink 
                        key={item.name} 
                        to={item.path} 
                        className={({ isActive }) => `
                            flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200
                            ${isActive 
                                ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" 
                                : "text-gray-400 glass-hover hover:text-white"
                            }
                        `}
                    >
                        <item.icon className="w-6 h-6" />
                        <span className="hidden md:block font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}