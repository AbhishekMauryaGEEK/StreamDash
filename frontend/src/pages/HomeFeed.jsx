import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // 👈 ADD THIS
import api from '../utils/axios';
import VideoCard from '../components/common/VideoCard';
import { useAuth } from '../context/AuthContext';

const HomeFeed = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams(); // 👈 HOOK INTO URL
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get the query from URL: e.g., /?query=anime
    const searchQuery = searchParams.get("query");

    const fetchVideos = async () => {
        setLoading(true);
        try {
            // 🔍 PASS THE QUERY TO THE BACKEND
            const res = await api.get(`/videos`, {
                params: {
                    query: searchQuery || "",
                    // page, limit, etc.
                }
            });
            setVideos(res.data.data.docs || res.data.data);
        } catch (err) {
            console.error("Error fetching home feed:", err);
        } finally {
            setLoading(false);
        }
    };

    // 🔄 RE-FETCH WHENEVER THE SEARCH QUERY CHANGES
    useEffect(() => { 
        fetchVideos(); 
    }, [searchQuery]); 

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Show search results header if searching */}
            {searchQuery && (
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-500 font-black uppercase text-[10px] tracking-widest">Results for:</span>
                    <span className="text-primary font-black italic uppercase">"{searchQuery}"</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.length > 0 ? (
                    videos.map((video) => (
                        <VideoCard
                            key={video._id}
                            video={video}
                            currentUser={user}
                            onVideoUpdate={fetchVideos}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 glass rounded-[2.5rem] border border-white/5">
                        <p className="text-gray-500 text-lg italic">
                            {searchQuery ? "No artifacts match your search query." : "No videos found. Be the first to upload!"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeFeed;