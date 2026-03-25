import React from 'react';
import { Search, Upload, Bell, User } from 'lucide-react';

export default function Header({ onOpenUpload }) {
    return (
        <header className="h-16 w-full glass border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex-1 max-w-2xl hidden sm:flex items-center bg-surface border border-border rounded-full px-4 py-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search..." className="w-full bg-transparent outline-none px-3" />
            </div>
            <div className="flex items-center gap-4 ml-auto">
                <button onClick={onOpenUpload} className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Upload
                </button>
                <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center"><User className="w-5 h-5" /></div>
            </div>
        </header>
    );
}