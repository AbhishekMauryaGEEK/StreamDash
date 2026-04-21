import React, { useEffect, useState } from 'react';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { ListMusic, Loader2, Trash2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Playlists() {
    const { user } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPlaylists = async () => {
        try {
            const res = await api.get(`/playlist/user/${user?._id}`);
            setPlaylists(res.data.data);
        } catch (err) {
            console.error("Playlist Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?._id) fetchPlaylists();
    }, [user]);

    const handleDeletePlaylist = async (e, playlistId) => {
        e.preventDefault(); // Prevent navigating to the playlist detail page
        e.stopPropagation();
        
        if (!window.confirm("Are you sure you want to delete this playlist?")) return;

        try {
            await api.delete(`/playlist/${playlistId}`);
            setPlaylists(prev => prev.filter(p => p._id !== playlistId));
        } catch (err) {
            console.error("Failed to delete playlist", err);
        }
    };

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    return (
        <div className="p-6 md:p-10 space-y-10">
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                Your Library
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                {playlists.map(playlist => (
                    <div key={playlist._id} className="group relative">
                        <Link to={`/playlist/${playlist._id}`}>
                            <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 transition-all duration-500 group-hover:border-primary/50 group-hover:scale-[1.02] bg-[#0f0f0f]">
                                {playlist.thumbnail ? (
                                    <>
                                        <img src={playlist.thumbnail} className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-125" alt="" />
                                        <img src={playlist.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt={playlist.name} />
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center"><ListMusic size={48} className="text-gray-800" /></div>
                                )}
                                
                                {/* Overlay with Delete Button */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                                    <div className="bg-primary p-3 rounded-full text-black shadow-xl">
                                        <Play fill="currentColor" size={20} />
                                    </div>
                                </div>

                                <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{playlist.videos?.length || 0} Videos</span>
                                </div>
                            </div>
                        </Link>

                        {/* External Delete Button (Visible on Hover) */}
                        <button 
                            onClick={(e) => handleDeletePlaylist(e, playlist._id)}
                            className="absolute top-4 right-4 z-10 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"
                            title="Delete Playlist"
                        >
                            <Trash2 size={16} />
                        </button>

                        <div className="mt-5 px-1">
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tight group-hover:text-primary transition-colors line-clamp-1">{playlist.name}</h3>
                            <p className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-widest">VIEW FULL PLAYLIST</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}