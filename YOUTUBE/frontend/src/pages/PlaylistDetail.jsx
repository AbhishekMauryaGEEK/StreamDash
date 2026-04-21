import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { Loader2, Trash2, Clock, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PlaylistDetail() {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchPlaylist = async () => {
        try {
            const res = await api.get(`/playlist/${playlistId}`);
            setPlaylist(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPlaylist(); }, [playlistId]);

    const handleRemoveVideo = async (videoId) => {
        try {
            await api.patch(`/playlist/remove/${videoId}/${playlistId}`);
            setPlaylist(prev => ({
                ...prev,
                playlistVideos: prev.playlistVideos.filter(v => v._id !== videoId)
            }));
        } catch (err) { console.error("Failed to remove video", err); }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    const coverVideo = playlist?.playlistVideos[0];

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-[#050505] overflow-hidden">
            {/* LEFT SIDE: THE STICKY HERO CARD */}
            <div className="w-full lg:w-[450px] p-8 lg:h-full flex flex-col justify-center relative">
                {/* Background Glow */}
                <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                    <img src={coverVideo?.thumbnail} className="w-full h-full object-cover blur-[120px]" alt="" />
                </div>

                <div className="relative glass border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
                        <img src={coverVideo?.thumbnail || "/placeholder.jpg"} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="text-white fill-white" size={48} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                            {playlist.name}
                        </h1>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-[0.2em]">
                            {playlist.playlistVideos.length} Tracks / Curated by You
                        </p>
                    </div>

                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                        {playlist.description || "No description provided for this collection."}
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE: THE SCROLLABLE LIST */}
            <div className="flex-1 overflow-y-auto p-8 pt-20 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-4">
                    {playlist.playlistVideos.map((video, index) => (
                        <div 
                            key={video._id} 
                            className="group flex items-center gap-6 p-4 rounded-3xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all"
                        >
                            <span className="text-gray-700 font-black italic text-xl w-8">{index + 1}</span>
                            
                            <div 
                                className="relative w-44 aspect-video rounded-2xl overflow-hidden cursor-pointer"
                                onClick={() => navigate(`/watch/${video._id}`)}
                            >
                                <img src={video.thumbnail} className="w-full h-full object-cover" alt="" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 
                                    className="text-white font-bold truncate cursor-pointer hover:text-primary transition"
                                    onClick={() => navigate(`/watch/${video._id}`)}
                                >
                                    {video.title}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                    <span className="font-bold uppercase tracking-widest text-primary/80">@{video.videoOwner?.username}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Clock size={12}/> {formatDistanceToNow(new Date(video.createdAt))} ago</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleRemoveVideo(video._id)}
                                className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}