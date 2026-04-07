import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/axios';
import VideoCard from '../components/common/VideoCard';
import { Loader2, PlaySquare } from 'lucide-react';

export default function ChannelPage() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [videos, setVideos] = useState([]); // 👈 State for videos
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannelData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Profile Info
            const userRes = await api.get(`/users/c/${username}`);
            const userData = userRes.data.data;
            setProfile(userData);

            // 2. Fetch Videos ONLY IF profile exists
            if (userData?._id) {
                const videoRes = await api.get(`/videos?userId=${userData._id}`);
                // Handle aggregatePaginate structure (data.docs)
                const videoData = videoRes.data.data.docs || videoRes.data.data;
                setVideos(videoData);
            }
        } catch (err) {
            console.error("Error fetching channel data:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchChannelData();
}, [username]);

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-gray-400">
            <Loader2 className="animate-spin w-10 h-10 text-primary" />
            <p>Loading channel...</p>
        </div>
    );

    if (!profile) return <div className="p-10 text-center text-white">Channel not found.</div>;

    return (
        <div className="text-white animate-in fade-in duration-500">
            {/* Cover Image */}
            <div className="h-48 md:h-64 w-full bg-[#121212] overflow-hidden">
                {profile.coverImage ? (
                    <img src={profile.coverImage} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-zinc-900 to-zinc-800" />
                )}
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-12 space-y-8 pb-20">
                {/* Channel Header */}
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-8 border-b border-white/10">
                    <img
                        src={profile.avatar}
                        className="w-40 h-40 rounded-full border-8 border-[#0a0a0a] object-cover shadow-2xl"
                        alt="Avatar"
                    />
                    <div className="flex-1 text-center md:text-left space-y-1 pb-2">
                        <h1 className="text-4xl font-black">{profile.fullname}</h1>
                        <p className="text-gray-400 font-medium tracking-tight">
                            @{profile.username} • {profile.subscribersCount} subscribers • {videos.length} videos
                        </p>
                    </div>
                    <div className="pb-2">
                        <button className="bg-white text-black px-10 py-3 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-lg">
                            Subscribe
                        </button>
                    </div>
                </div>

                {/* Videos Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b-2 border-primary w-fit pb-2 px-1">
                        <PlaySquare className="w-5 h-5 text-primary" />
                        <span className="font-bold uppercase tracking-wider text-sm">Videos</span>
                    </div>

                    {videos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                            {videos.map((video) => (
                                <VideoCard key={video._id} video={video} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-500 space-y-4 bg-white/5 rounded-[2rem] border border-white/5">
                            <PlaySquare size={48} className="opacity-20" />
                            <p className="italic font-medium">This channel hasn't uploaded any videos yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}