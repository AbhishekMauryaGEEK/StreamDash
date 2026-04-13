import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Loader2 } from 'lucide-react';
import api from '../utils/axios';
import { formatDistanceToNow } from 'date-fns';
import VideoListCard from '../components/common/VideoListCard'; 
import SubscribeButton from '../components/subscription/SubscribeButton';
import { useAuth } from '../context/AuthContext'; // Import auth context

export default function WatchPage() {
    const { user: currentUser } = useAuth(); // Get logged in user
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllPageData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [videoRes, recRes] = await Promise.all([
                    api.get(`/videos/${videoId}`),
                    api.get('/videos')
                ]);

                const currentVideo = videoRes.data.data;
                const allVideos = recRes.data.data.docs || [];

                setVideo(currentVideo);
                setRecommendations(allVideos.filter(v => v._id !== videoId));
                
                window.scrollTo(0, 0);
            } catch (err) {
                console.error("Watch Page Load Error:", err);
                setError(err.response?.data?.message || "Failed to load video");
            } finally {
                setLoading(false);
            }
        };

        if (videoId) fetchAllPageData();
    }, [videoId]);

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );

    if (error || !video) return (
        <div className="flex h-[80vh] items-center justify-center text-white p-4 text-center">
            <div className="bg-red-500/10 p-8 rounded-3xl border border-red-500/20 max-w-md">
                <p className="text-xl font-bold mb-2">Oops!</p>
                <p className="text-gray-400">{error || "We couldn't find that video."}</p>
                <Link to="/" className="mt-4 inline-block bg-white text-black px-6 py-2 rounded-full font-bold">Go Home</Link>
            </div>
        </div>
    );

    const channel = video.owner || video.ownerDetails;

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-8 max-w-[1800px] mx-auto animate-in fade-in duration-500">
            {/* LEFT SIDE */}
            <div className="flex-1">
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10">
                    <video 
                        src={video.videoFile} 
                        controls 
                        autoPlay 
                        className="w-full h-full" 
                        poster={video.thumbnail} 
                    />
                </div>

                <div className="mt-5 space-y-4">
                    <h1 className="text-2xl font-black text-white leading-tight">{video.title}</h1>

                    <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                            <Link to={`/c/${channel?.username}`}>
                                <img src={channel?.avatar} alt={channel?.username} className="w-12 h-12 rounded-full border border-white/10 object-cover" />
                            </Link>
                            <div>
                                <Link to={`/c/${channel?.username}`} className="flex items-center gap-1 font-bold text-white hover:text-primary transition">
                                    {channel?.username || "Unknown Channel"}
                                    <CheckCircle size={14} className="text-primary fill-primary/10" />
                                </Link>
                                <p className="text-xs text-gray-400">
                                    {channel?.subscribersCount || 0} subscribers
                                </p>
                            </div>

                            {/* Don't show subscribe button on your own videos */}
                            {currentUser?._id !== channel?._id && (
                                <div className="ml-4">
                                    <SubscribeButton 
                                        channelId={channel?._id} 
                                        initialIsSubscribed={video.isSubscribed} 
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                            <div className="flex items-center">
                                <button className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10 rounded-l-full border-r border-white/10 transition">
                                    <ThumbsUp size={18} /> {video.views}
                                </button>
                                <button className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 rounded-r-full transition">
                                    <ThumbsDown size={18} />
                                </button>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10 rounded-full transition">
                                <Share2 size={18} /> Share
                            </button>
                            <button className="p-2 text-white hover:bg-white/10 rounded-full transition">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <p className="text-sm font-bold text-white mb-1">
                            {video.views} views • {formatDistanceToNow(new Date(video.createdAt))} ago
                        </p>
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{video.description}</p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE (Recommendations) */}
            <div className="lg:w-[400px] flex flex-col gap-4">
                <h3 className="text-white font-bold text-lg px-2">Up Next</h3>
                <div className="flex flex-col gap-4">
                    {recommendations.length > 0 ? (
                        recommendations.map((recVideo) => (
                            <VideoListCard key={recVideo._id} video={recVideo} />
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm italic px-2">No other videos found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}