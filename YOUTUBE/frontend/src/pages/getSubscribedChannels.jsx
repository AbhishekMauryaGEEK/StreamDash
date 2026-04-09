import React, { useEffect, useState } from 'react';
import api from '../utils/axios';
import { Link } from 'react-router-dom';
import { Loader2, Users } from 'lucide-react';

export default function SubscriptionsPage() {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubs = async () => {
            try {
                // Your getSubscribedChannels controller route
                const res = await api.get('/subscriptions/subscribed-to');
                setChannels(res.data.data);
            } finally { setLoading(false); }
        };
        fetchSubs();
    }, []);

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-6 text-white">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Users className="text-primary" /> Subscriptions
            </h2>
            
            <div className="space-y-4">
                {channels.map((sub) => (
                    <Link 
                        to={`/c/${sub.subscribedChannel.username}`} 
                        key={sub._id}
                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition border border-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <img src={sub.subscribedChannel.avatar} className="w-14 h-14 rounded-full object-cover" alt="" />
                            <div>
                                <h3 className="font-bold">{sub.subscribedChannel.fullname}</h3>
                                <p className="text-sm text-gray-400">@{sub.subscribedChannel.username}</p>
                            </div>
                        </div>
                        <span className="text-xs text-primary font-bold uppercase tracking-widest">View Channel</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}