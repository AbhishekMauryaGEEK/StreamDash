import React, { useState } from 'react';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

export default function CommentInput({ videoId, onCommentAdded }) {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await api.post(`/Comment/v/${videoId}`, { content });
            setContent("");
            if (onCommentAdded) onCommentAdded(res.data.data);
        } catch (err) {
            console.error("Comment Post Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-4 items-start mb-10 group">
            <img 
                src={user?.avatar} 
                className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0" 
                alt="avatar" 
            />
            <div className="flex-1 border-b border-white/10 focus-within:border-primary transition-colors duration-300">
                <input
                    type="text"
                    placeholder="Add a comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-transparent py-2 outline-none text-sm text-white placeholder:text-gray-500"
                />
                <div className="flex justify-end gap-3 h-0 group-focus-within:h-12 group-focus-within:mt-2 overflow-hidden transition-all duration-300">
                    <button
                        type="button"
                        onClick={() => setContent("")}
                        className="px-4 py-1 text-xs font-bold text-gray-400 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isSubmitting || !content.trim()}
                        className="bg-primary text-black px-5 py-1 rounded-full font-bold text-xs disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
                    >
                        {isSubmitting ? "Posting..." : "Comment"}
                    </button>
                </div>
            </div>
        </form>
    );
}