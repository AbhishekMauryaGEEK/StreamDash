import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ThumbsDown, Share2, MoreHorizontal, Loader2 } from 'lucide-react';
import api from '../utils/axios';
import { formatDistanceToNow } from 'date-fns';
import VideoListCard from '../components/common/VideoListCard'; 
import FollowButton from "../components/follow/FollowButton";
import LikeButton from "../components/common/LikeButton"; 
import { useAuth } from '../context/AuthContext';

export default function WatchPage() {
    const { user: currentUser } = useAuth();
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllPageData = async () => {
        try {
            setLoading(true);
            const [videoRes, recRes] = await Promise.all([
                api.get(`/videos/${videoId}`),
                api.get('/videos')
            ]);

            setVideo(videoRes.data.data);
            const allVideos = recRes.data.data.docs || [];
            setRecommendations(allVideos.filter(v => v._id !== videoId));
            window.scrollTo(0, 0);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load video");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (videoId) fetchAllPageData();
    }, [videoId]);

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );

    if (error || !video) return (
        <div className="flex h-[80vh] items-center justify-center text-white p-4">
            <div className="bg-red-500/10 p-8 rounded-3xl border border-red-500/20 text-center">
                <p className="text-xl font-bold mb-2">Error</p>
                <p className="text-gray-400">{error}</p>
                <Link to="/" className="mt-4 inline-block bg-white text-black px-6 py-2 rounded-full font-bold">Back Home</Link>
            </div>
        </div>
    );

    const channel = video.owner;

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-8 max-w-[1800px] mx-auto">
            <div className="flex-1">
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl">
                    <video src={video.videoFile} controls autoPlay className="w-full h-full" poster={video.thumbnail} />
                </div>

                <div className="mt-5 space-y-4">
                    <h1 className="text-2xl font-black text-white">{video.title}</h1>

                    <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <Link to={`/c/${channel?.username}`}>
                                <img src={channel?.avatar} className="w-12 h-12 rounded-full object-cover" alt="avatar" />
                            </Link>
                            <div>
                                <Link to={`/c/${channel?.username}`} className="flex items-center gap-1 font-bold">
                                    {channel?.username} <CheckCircle size={14} className="text-primary" />
                                </Link>
                                <p className="text-xs text-gray-400">{channel?.subscribersCount || 0} followers</p>
                            </div>

                            {currentUser?._id !== channel?._id && (
                                <FollowButton 
                                    userId={channel?._id} 
                                    initialIsFollowed={channel?.isSubscribed} 
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                            <LikeButton 
                                id={video._id}
                                type="v"
                                initialIsLiked={video.isLiked}
                                initialCount={video.likesCount}
                            />
                            <button className="px-4 py-2 text-white hover:bg-white/10 rounded-r-full border-l border-white/10">
                                <ThumbsDown size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <p className="text-sm font-bold">{video.views} views • {formatDistanceToNow(new Date(video.createdAt))} ago</p>
                        <p className="text-sm text-gray-300 mt-2">{video.description}</p>
                    </div>
                </div>
            </div>

            <div className="lg:w-[400px] space-y-4">
                <h3 className="font-bold px-2">Up Next</h3>
                {recommendations.map(rec => <VideoListCard key={rec._id} video={rec} />)}
            </div>
        </div>
    );
}