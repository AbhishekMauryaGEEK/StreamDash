import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/axios';
import VideoCard from '../components/common/VideoCard';

export default function ChannelPage() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/users/c/${username}`);
                setProfile(res.data.data);
            } catch (err) {
                console.error("Profile not found");
            }
        };
        fetchProfile();
    }, [username]);

    if (!profile) return <div className="p-10 text-center">Loading Channel...</div>;

    return (
        <div className="text-white">
            {/* Cover Image */}
            <div className="  h-48 md:h-64 w-full bg-[#121212] overflow-hidden">
                {profile.coverImage && <img src={profile.coverImage} className="w-full h-full object-cover opacity-100" />}
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-12 space-y-8">
                {/* Channel Header */}
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-8 border-b border-white/10">
                    <img src={profile.avatar} className="w-32 h-32 rounded-full border-4 border-background object-cover shadow-xl" />
                    <div className="flex-1 text-center md:text-left space-y-1">
                        <h1 className="text-4xl font-bold">{profile.fullname}</h1>
                        <p className="text-gray-400">@{profile.username} • {profile.subscribersCount} subscribers</p>
                    </div>
                    <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all">
                        Subscribe
                    </button>
                </div>

                {/* Videos Tab Placeholder */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <p className="col-span-full text-center text-gray-500 py-20 italic">No videos uploaded by this user.</p>
                </div>
            </div>
        </div>
    );
}