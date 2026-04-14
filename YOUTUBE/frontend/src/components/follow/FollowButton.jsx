import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { Loader2 } from 'lucide-react';

export default function FollowButton({ userId, initialIsFollowed, onSuccess }) {
    const [isFollowed, setIsFollowed] = useState(initialIsFollowed);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsFollowed(initialIsFollowed);
    }, [initialIsFollowed]);

    const handleToggle = async (e) => {
        // Prevent event bubbling if this button is inside a clickable card
        e.preventDefault(); 
        e.stopPropagation();
        
        setIsLoading(true);
        try {
            // Updated Endpoint: /follow/u/:userId
            const res = await api.post(`/follow/u/${userId}`);
            
            // Backend now returns { followed: true/false }
            const status = res.data.data.followed;
            setIsFollowed(status);
            
            if (onSuccess) onSuccess(status);
        } catch (err) {
            console.error("Follow toggle failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button 
            onClick={handleToggle} 
            disabled={isLoading}
            className={`px-6 py-2 rounded-full font-bold transition-all duration-300 flex items-center justify-center min-w-[120px] ${
                isFollowed 
                ? "bg-zinc-800 text-white border border-white/10 hover:bg-zinc-700" 
                : "bg-white text-black hover:bg-gray-200"
            }`}
        >
            {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
            ) : (
                isFollowed ? "Following" : "Follow"
            )}
        </button>
    );
}