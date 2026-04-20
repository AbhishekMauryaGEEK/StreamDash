import React, { useState, useEffect } from 'react';
import { X, Plus, ListMusic, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../utils/axios';

export default function PlaylistModal({ videoId, onClose }) {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [actionLoading, setActionLoading] = useState(null); // Track which playlist is being updated

    const fetchUserPlaylists = async () => {
        try {
            // Replace with actual user ID from AuthContext if needed, 
            // but your route /user/:userId usually needs it.
            const userRes = await api.get('/users/current-user');
            const res = await api.get(`/playlist/user/${userRes.data.data._id}`);
            setPlaylists(res.data.data);
        } catch (err) {
            console.error("Error fetching playlists", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUserPlaylists(); }, []);

    const toggleVideoInPlaylist = async (playlistId, isAlreadyIn) => {
        setActionLoading(playlistId);
        try {
            const endpoint = isAlreadyIn ? 'remove' : 'add';
            await api.patch(`/playlist/${endpoint}/${videoId}/${playlistId}`);
            // Update local state to show change immediately
            setPlaylists(prev => prev.map(p => {
                if (p._id === playlistId) {
                    const newVideos = isAlreadyIn 
                        ? p.videos.filter(v => v !== videoId) 
                        : [...p.videos, videoId];
                    return { ...p, videos: newVideos };
                }
                return p;
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;
        try {
            const res = await api.post('/playlist', { 
                name: newPlaylistName, 
                description: "My new playlist" 
            });
            setPlaylists([res.data.data, ...playlists]);
            setNewPlaylistName("");
            setShowCreate(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <ListMusic className="text-primary" size={20} /> Save to...
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Playlist List */}
                <div className="max-h-60 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>
                    ) : (
                        playlists.map(playlist => {
                            const isAdded = playlist.videos.includes(videoId);
                            return (
                                <button
                                    key={playlist._id}
                                    onClick={() => toggleVideoInPlaylist(playlist._id, isAdded)}
                                    disabled={actionLoading === playlist._id}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all group"
                                >
                                    <span className="text-sm font-bold text-gray-300 group-hover:text-white">{playlist.name}</span>
                                    {actionLoading === playlist._id ? (
                                        <Loader2 size={18} className="animate-spin text-primary" />
                                    ) : isAdded ? (
                                        <CheckCircle2 size={18} className="text-primary fill-primary/10" />
                                    ) : (
                                        <div className="w-[18px] h-[18px] border-2 border-gray-600 rounded-sm" />
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Create New Playlist Section */}
                <div className="p-4 bg-white/5">
                    {!showCreate ? (
                        <button 
                            onClick={() => setShowCreate(true)}
                            className="w-full flex items-center gap-3 p-2 text-sm font-bold text-primary hover:text-white transition"
                        >
                            <Plus size={20} /> Create new playlist
                        </button>
                    ) : (
                        <div className="space-y-3 animate-in slide-in-from-bottom-2">
                            <input 
                                autoFocus
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                placeholder="Enter playlist name..."
                                className="w-full bg-black border border-white/10 p-3 rounded-xl text-sm outline-none focus:border-primary transition"
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs font-bold text-gray-400">Cancel</button>
                                <button onClick={handleCreatePlaylist} className="px-4 py-2 text-xs font-bold bg-primary text-black rounded-full">Create</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}