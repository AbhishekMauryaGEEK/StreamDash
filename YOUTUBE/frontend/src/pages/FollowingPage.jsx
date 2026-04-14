import React, { useEffect, useState } from 'react';
import api from '../utils/axios';
import { Link } from 'react-router-dom';
import { Loader2, Users } from 'lucide-react';
import FollowButton from '../components/follow/FollowButton';

export default function FollowingPage() {
    const [followingList, setFollowingList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFollowing = async () => {
        try {
            // Updated Endpoint: /follow/list/following
            const res = await api.get('follow/list/following');
            
            // Our new aggregation returns: [{ details: { username, avatar, ... } }]
            setFollowingList(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch following list", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFollowing();
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
                        <Users className="text-primary w-8 h-8" />
                        Following
                    </h1>
                    <p className="text-gray-400">People you are connected with</p>
                </div>
                <div className="text-sm font-bold bg-white/5 px-4 py-2 rounded-full border border-white/10 text-gray-300">
                    {followingList.length} Following
                </div>
            </header>

            {followingList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {followingList.map((item, index) => {
                        const person = item.details;
                        if (!person) return null;
                        
                        return (
                            <div
                                key={person._id || index}
                                className="group flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/[0.07] transition-all duration-300 shadow-xl"
                            >
                                <Link to={`/c/${person.username}`} className="flex items-center gap-4 flex-1">
                                    <img
                                        src={person.avatar}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-all shadow-lg"
                                        alt={person.username}
                                    />
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight group-hover:text-primary transition-colors">
                                            {person.fullName || person.username}
                                        </h3>
                                        <p className="text-sm text-gray-400">@{person.username}</p>
                                    </div>
                                </Link>

                                <div className="flex items-center gap-2">
                                    <FollowButton
                                        userId={person._id}
                                        initialIsFollowed={true}
                                        onSuccess={fetchFollowing}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                        <Users size={40} />
                    </div>
                    <p className="text-gray-400 max-w-xs mx-auto">You aren't following anyone yet.</p>
                    <Link to="/" className="text-primary font-bold hover:underline">Discover People</Link>
                </div>
            )}
        </div>
    );
}