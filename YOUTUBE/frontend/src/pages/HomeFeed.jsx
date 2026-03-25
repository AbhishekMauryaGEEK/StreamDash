import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import VideoCard from '../components/common/VideoCard';

const HomeFeed = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // Hits your backend GET /api/v1/videos
                const res = await api.get('/videos');
                setVideos(res.data.data);
            } catch (err) {
                console.error("Error fetching videos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.length > 0 ? (
                videos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                ))
            ) : (
                <div className="col-span-full text-center py-20 glass rounded-3xl border border-white/5">
                    <p className="text-gray-500 text-lg italic">No videos found. Be the first to upload!</p>
                </div>
            )}
        </div>
    );
};

export default HomeFeed;