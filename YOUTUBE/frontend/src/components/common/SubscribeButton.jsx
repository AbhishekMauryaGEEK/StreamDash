import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Loader2 } from 'lucide-react';

export default function SubscribeButton({ channelId, initialIsSubscribed }) {
    const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscription = async () => {
        setIsLoading(true);
        try {
            // Your toggleSubscription controller route
            await api.post(`/subscriptions/c/${channelId}`);
            setIsSubscribed(!isSubscribed);
        } catch (error) {
            console.error("Subscription toggle failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleSubscription}
            disabled={isLoading}
            className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${
                isSubscribed 
                ? "bg-zinc-800 text-white hover:bg-zinc-700" 
                : "bg-white text-black hover:bg-zinc-200"
            }`}
        >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isSubscribed ? "Subscribed" : "Subscribe"}
        </button>
    );
}