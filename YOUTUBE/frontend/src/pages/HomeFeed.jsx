import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import VideoCard from '../components/common/VideoCard';
import { useAuth } from '../context/AuthContext';

const HomeFeed = () => {
    const { user } = useAuth(); // Logged in user from context
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVideos = async () => {
        try {
            const res = await api.get('/videos');
            // Support both aggregated and simple list responses
            setVideos(res.data.data.docs || res.data.data);
        } catch (err) {
            console.error("Error fetching home feed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchVideos(); 
    }, []);

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.length > 0 ? (
                videos.map((video) => (
                    <VideoCard
                        key={video._id}
                        video={video}
                        currentUser={user} // Pass logged-in user
                        onVideoUpdate={fetchVideos} // Correct refresh function
                    />
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