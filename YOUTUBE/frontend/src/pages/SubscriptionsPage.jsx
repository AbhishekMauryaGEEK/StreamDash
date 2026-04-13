import React, { useEffect, useState } from 'react';
import api from '../utils/axios';
import { Link } from 'react-router-dom';
import { Loader2, Youtube } from 'lucide-react';
import SubscribeButton from '../components/subscription/SubscribeButton';

export default function SubscriptionsPage() {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscriptions = async () => {
        try {
       const res = await api.get('/subscriptions/u/subscribed');
            
            console.log("--- SUBSCRIPTIONS FETCHED ---", res.data.data);
            // In your controller, data is the array itself
            setChannels(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch subscriptions", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Youtube className="text-primary w-8 h-8" />
                        Subscriptions
                    </h1>
                    <p className="text-gray-400">Manage the channels you follow</p>
                </div>
                <div className="text-sm font-bold bg-white/5 px-4 py-2 rounded-full border border-white/10 text-gray-300">
                    {channels.length} Channels
                </div>
            </header>

            {channels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {channels.map((sub, index) => {
                        const chan = sub.subscribedChannel;
                        if (!chan) return null;
                        
                        return (
                            <div
                                key={chan._id || index}
                                className="group flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/[0.07] transition-all duration-300 shadow-xl"
                            >
                                <Link to={`/c/${chan.username}`} className="flex items-center gap-4 flex-1">
                                    <img
                                        src={chan.avatar}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-all shadow-lg"
                                        alt={chan.username}
                                    />
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight group-hover:text-primary transition-colors">
                                            {chan.fullName || chan.username}
                                        </h3>
                                        <p className="text-sm text-gray-400">@{chan.username}</p>
                                    </div>
                                </Link>

                                <div className="flex items-center gap-2">
                                    <SubscribeButton
                                        channelId={chan._id}
                                        initialIsSubscribed={true}
                                        onSuccess={fetchSubscriptions} // Refresh list on unsubscribe
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                        <Youtube size={40} />
                    </div>
                    <p className="text-gray-400 max-w-xs mx-auto">You haven't subscribed to any channels yet.</p>
                    <Link to="/" className="text-primary font-bold hover:underline">Explore Videos</Link>
                </div>
            )}
        </div>
    );
}