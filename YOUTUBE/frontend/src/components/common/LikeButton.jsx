import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { ThumbsUp, Loader2 } from 'lucide-react';

export default function LikeButton({ 
    id, 
    type = 'v', // 'v' for video, 'c' for comment, 't' for tweet
    initialIsLiked = false, 
    initialCount = 0,
    size = 20 
}) {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [count, setCount] = useState(initialCount);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLiked(initialIsLiked);
        setCount(initialCount);
    }, [initialIsLiked, initialCount]);

    const handleToggleLike = async (e) => {
        e.preventDefault(); e.stopPropagation();
        
        // Optimistic Update
        const previousState = isLiked;
        const previousCount = count;
        
        setIsLiked(!isLiked);
        setCount(prev => isLiked ? prev - 1 : prev + 1);
        setIsLoading(true);

        try {
            const res = await api.post(`/likes/toggle/${type}/${id}`);
            // Sync with actual server response
            setIsLiked(res.data.data.isLiked);
        } catch (err) {
            console.error("Like toggle failed", err);
            // Rollback on error
            setIsLiked(previousState);
            setCount(previousCount);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button 
            onClick={handleToggleLike}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                isLiked 
                ? "text-primary bg-primary/10 border border-primary/20" 
                : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
        >
            {isLoading ? (
                <Loader2 className="animate-spin" size={size} />
            ) : (
                <ThumbsUp 
                    size={size} 
                    className={isLiked ? "fill-primary" : ""} 
                />
            )}
            <span className="text-sm font-bold">{count}</span>
        </button>
    );
}