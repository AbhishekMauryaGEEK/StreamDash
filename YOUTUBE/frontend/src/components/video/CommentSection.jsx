import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { Send, Heart, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CommentSection({ videoId }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);

    const fetchComments = async () => {
        if (!videoId) return;
        setLoading(true);
        try {
            await api.get(`/Comment/${videoId}`);
            // Check if backend uses pagination (docs) or plain array
            const data = res.data.data.docs || res.data.data;
            setComments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch Comments Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [videoId]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setPosting(true);
        try {
            const res = await api.post(`/Comment/${videoId}`, { content: newComment });
            
            // Optimistic UI Update
            const optimisticComment = {
                ...res.data.data,
                ownerDetails: {
                    username: user?.username,
                    avatar: user?.avatar
                },
                likesCount: 0,
                isLiked: false
            };
            
            setComments(prev => [optimisticComment, ...prev]);
            setNewComment("");
        } catch (err) {
            console.error("Post failed", err);
        } finally {
            setPosting(false);
        }
    };

    if (loading && comments.length === 0) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8 mt-10 animate-in fade-in duration-700">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                {comments.length} Artifact Comments
            </h3>

            {/* Input Area - FIXED TAGS HERE */}
            <form onSubmit={handlePostComment} className="relative group">
                <div className="flex items-start gap-4 glass border border-white/10 p-6 rounded-[2rem] focus-within:border-primary/50 transition-all shadow-2xl">
                    <img 
                        src={user?.avatar} 
                        className="w-10 h-10 rounded-full border border-white/10 shrink-0 object-cover" 
                        alt="Me" 
                    />
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Join the grid..."
                        className="w-full bg-transparent outline-none text-white placeholder:text-gray-600 resize-none py-2 text-sm"
                        rows="1"
                    />
                    <button 
                        type="submit"
                        disabled={posting || !newComment.trim()}
                        className="p-3 bg-primary text-white rounded-2xl hover:scale-110 transition-all disabled:opacity-30 disabled:grayscale"
                    >
                        {posting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px] text-center py-10">
                        No transmissions found in this sector.
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="group flex gap-4 p-4 hover:bg-white/[0.02] rounded-[1.5rem] transition-colors">
                            <img 
                                src={comment.ownerDetails?.avatar} 
                                className="w-10 h-10 rounded-full border border-white/5 object-cover" 
                                alt="" 
                            />
                            
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-xs uppercase tracking-widest text-primary italic">
                                        {comment.ownerDetails?.username || 'Unknown User'}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">
                                        {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt)) : 'just now'} ago
                                    </span>
                                </div>
                                
                                <p className="text-sm text-gray-300 leading-relaxed font-medium">
                                    {comment.content}
                                </p>

                                <div className="flex items-center gap-4 pt-2">
                                    <button className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-white'}`}>
                                        <Heart size={12} fill={comment.isLiked ? "currentColor" : "none"} />
                                        {comment.likesCount || 0}
                                    </button>
                                </div>
                            </div>

                            {comment.owner === user?._id && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}