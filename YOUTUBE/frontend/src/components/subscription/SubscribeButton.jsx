import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { Loader2 } from 'lucide-react';

export default function SubscribeButton({ channelId, initialIsSubscribed, onSuccess }) {
    const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsSubscribed(initialIsSubscribed);
    }, [initialIsSubscribed]);

    const handleToggle = async (e) => {
        e.preventDefault(); e.stopPropagation();
        setIsLoading(true);
        try {
            const res = await api.post(`/subscriptions/c/${channelId}`);
            setIsSubscribed(res.data.data.subscribed);
            if (onSuccess) onSuccess(res.data.data.subscribed);
        } catch (err) {
            console.error("Toggle failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button 
            onClick={handleToggle} 
            disabled={isLoading}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
                isSubscribed ? "bg-zinc-800 text-white" : "bg-white text-black"
            }`}
        >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : (isSubscribed ? "Subscribed" : "Subscribe")}
        </button>
    );
}