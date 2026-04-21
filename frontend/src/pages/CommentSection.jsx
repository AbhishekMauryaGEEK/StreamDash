import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import LikeButton from '../common/LikeButton';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react'; // For delete functionality
import { useAuth } from '../../context/AuthContext';

export default function CommentSection({ videoId }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/Comment/v/${videoId}`);
            // Note the .docs because of aggregatePaginate
            setComments(res.data.data.docs || []);
        } catch (err) {
            console.error("Failed to fetch comments", err);
        }
    };

    useEffect(() => {
        if (videoId) fetchComments();
    }, [videoId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setLoading(true);
        try {
            await api.post(`/Comment/v/${videoId}`, { content: newComment });
            setNewComment("");
            fetchComments(); // Refresh list
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await api.delete(`/Comment/c/${commentId}`);
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="mt-10 pt-10 border-t border-white/5 space-y-8">
            <h3 className="text-2xl font-black text-white">{comments.length} Comments</h3>
            
            <form onSubmit={handleSubmit} className="flex items-start gap-4 group">
                <img src={user?.avatar} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="me" />
                <div className="flex-1 space-y-3">
                    <input 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full bg-transparent border-b border-white/10 py-2 focus:border-primary outline-none transition-all duration-300"
                    />
                    <div className="flex justify-end">
                        <button 
                            disabled={loading || !newComment.trim()}
                            className="bg-primary text-black px-6 py-2 rounded-full font-bold hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all"
                        >
                            {loading ? "Posting..." : "Comment"}
                        </button>
                    </div>
                </div>
            </form>

            <div className="space-y-8">
                {comments.map(comment => (
                    <div key={comment._id} className="flex gap-4 group animate-in fade-in slide-in-from-left-4">
                        <img src={comment.ownerDetails?.avatar} className="w-10 h-10 rounded-full object-cover shadow-lg" alt="avatar" />
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">@{comment.ownerDetails?.username}</span>
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(comment.createdAt))} ago
                                    </span>
                                </div>
                                {user?._id === comment.owner && (
                                    <button 
                                        onClick={() => handleDelete(comment._id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                            <div className="pt-2">
                                <LikeButton 
                                    id={comment._id} 
                                    type="c" // 'c' tells the button to hit /likes/toggle/c/
                                    initialIsLiked={comment.isLiked} 
                                    initialCount={comment.likesCount}
                                    size={16}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}