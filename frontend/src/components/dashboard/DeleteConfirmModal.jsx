import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ videoTitle, onConfirm, onClose }) {
    const [inputValue, setInputValue] = useState("");

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#0f0f0f] border-2 border-red-500/30 w-full max-w-md rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                        <AlertTriangle size={32} />
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><X /></button>
                </div>

                <h3 className="text-2xl font-black italic uppercase text-white mb-2">Nuclear Option</h3>
                <p className="text-gray-400 text-sm mb-6">
                    You are about to permanently delete <span className="text-white font-bold">"{videoTitle}"</span>. 
                    This action cannot be undone.
                </p>

                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500/60">
                        Type <span className="text-red-500 underline">DELETE</span> to confirm
                    </p>
                    <input 
                        autoFocus
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type DELETE here..."
                        className="w-full bg-black border-2 border-white/5 p-4 rounded-2xl text-white font-bold outline-none focus:border-red-500 transition-all uppercase"
                    />
                    
                    <button
                        disabled={inputValue !== "DELETE"}
                        onClick={onConfirm}
                        className="w-full py-4 rounded-2xl bg-red-600 text-white font-black italic uppercase tracking-widest disabled:opacity-20 disabled:grayscale hover:bg-red-500 transition-all shadow-lg"
                    >
                        Destroy Video
                    </button>
                </div>
            </div>
        </div>
    );
}