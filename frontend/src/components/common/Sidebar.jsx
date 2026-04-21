import React from 'react';
import { Home, BarChart3, Settings, Users, ListMusic, Youtube } from 'lucide-react'; 
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Playlists', icon: ListMusic, path: '/playlists' },
    { name: 'Following', icon: Users, path: '/following' }, 
    { name: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-16 md:w-64 glass border-r border-white/5 z-40 flex flex-col bg-black">
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <Youtube className="w-8 h-8 text-primary" />
                <span className="hidden md:block ml-3 text-xl font-black uppercase italic tracking-tighter text-white">
                    StreamDash
                </span>
            </div>

            <nav className="flex-1 py-8 px-4 space-y-4">
                {navItems.map((item) => (
                    <NavLink 
                        key={item.name} 
                        to={item.path} 
                        className={({ isActive }) => `
                            flex items-center gap-5 transition-all duration-200 group
                            ${isActive 
                                ? "text-primary scale-105" 
                                : "text-zinc-600 hover:text-white"
                            }
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon 
                                    className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'stroke-[3px]' : 'group-hover:scale-110'}`} 
                                />
                                <span className={`
                                    hidden md:block uppercase text-[11px] tracking-[0.25em] italic
                                    ${isActive ? "font-black" : "font-bold"}
                                `}>
                                    {item.name}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}