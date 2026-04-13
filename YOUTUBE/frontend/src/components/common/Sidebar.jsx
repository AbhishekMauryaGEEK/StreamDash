import React from 'react';
import { Home, PlaySquare, Youtube, BarChart3, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Videos', icon: PlaySquare, path: '/videos' },
    { name: 'Subscriptions', icon: Youtube, path: '/subscriptions' },
    { name: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { name: 'Settings', icon: Settings, path: '/settings' },
    
];

export default function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-16 md:w-64 glass border-r border-white/5 z-40 flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <Youtube className="w-8 h-8 text-primary" />
                <span className="hidden md:block ml-3 text-xl font-bold">StreamDash</span>
            </div>
            <nav className="flex-1 py-6 px-3 space-y-2">
                {navItems.map((item) => (
                    <NavLink key={item.name} to={item.path} className="flex items-center gap-4 px-3 py-3 rounded-xl text-gray-400 glass-hover">
                        <item.icon className="w-6 h-6" />
                        <span className="hidden md:block font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}