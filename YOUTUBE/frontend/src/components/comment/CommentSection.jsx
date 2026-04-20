import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/axios';
import CommentInput from './CommentInput';
import CommentCard from './CommentCard';
import { Loader2 } from 'lucide-react';

export default function CommentSection({ videoId }) {
    const [comments, setComments] = useState([]);
    const [totalComments, setTotalComments] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchComments = useCallback(async () => {
        try {
            const res = await api.get(`/Comment/v/${videoId}`);
            // AggregatePaginate returns data in .docs
            setComments(res.data.data.docs || []);
            setTotalComments(res.data.data.totalDocs || 0);
        } catch (err) {
            console.error("Fetch Comments Error:", err);
        } finally {
            setLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        if (videoId) fetchComments();
    }, [videoId, fetchComments]);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/Comment/c/${id}`);
            setComments(prev => prev.filter(c => c._id !== id));
            setTotalComments(prev => prev - 1);
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    if (loading) return <Loader2 className="animate-spin text-primary mx-auto my-10" />;

    return (
        <section className="mt-12 border-t border-white/5 pt-8 max-w-4xl">
            <h2 className="text-xl font-black text-white mb-8">{totalComments} Comments</h2>
            
            <CommentInput 
                videoId={videoId} 
                onCommentAdded={fetchComments} 
            />

            <div className="space-y-8">
                {comments.length > 0 ? (
                    comments.map(comment => (
                        <CommentCard 
                            key={comment._id} 
                            comment={comment} 
                            onDelete={handleDelete} 
                        />
                    ))
                ) : (
                    <p className="text-gray-500 text-sm italic">No comments yet.</p>
                )}
            </div>
        </section>
    );
}