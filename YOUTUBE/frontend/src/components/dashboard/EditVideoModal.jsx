import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

export default function EditVideoModal({ video, onClose, onSave }) {
    const [title, setTitle] = useState(video.title);
    const [description, setDescription] = useState(video.description);
    const [thumbnail, setThumbnail] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        if (thumbnail) formData.append("thumbnail", thumbnail);
        
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0f0f0f] border-2 border-white/10 w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black italic uppercase text-white">Edit Artifact</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Title</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-primary transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Description</label>
                        <textarea 
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-primary transition-all resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <div className="w-20 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                            <img src={video.thumbnail} className="w-full h-full object-cover opacity-50" alt="" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Change Thumbnail</p>
                            <input 
                                type="file" 
                                onChange={(e) => setThumbnail(e.target.files[0])}
                                className="text-xs text-gray-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-primary file:text-white"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full py-4 rounded-2xl bg-white text-black font-black italic uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl"
                    >
                        Update Details
                    </button>
                </form>
            </div>
        </div>
    );
}