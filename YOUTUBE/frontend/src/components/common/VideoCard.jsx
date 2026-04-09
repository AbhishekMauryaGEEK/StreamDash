import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
    MoreVertical, CheckCircle, Trash2, Edit,
    Eye, EyeOff, Share2, Loader2, X 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';

export default function VideoCard({ video, currentUser, onVideoUpdate }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false); // 🚩 RESTORED
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    
    // --- Edit Form States ---
    const [editTitle, setEditTitle] = useState(video?.title || "");
    const [editDescription, setEditDescription] = useState(video?.description || "");
    const [newThumbnail, setNewThumbnail] = useState(null);

    const menuRef = useRef(null);

    // --- Ownership Check ---
    const videoOwnerId = video.ownerDetails?._id || video.owner?._id || video.owner;
    const loggedInUserId = currentUser?._id || currentUser?.id;
    const isOwner = loggedInUserId && videoOwnerId && 
                    String(loggedInUserId).trim() === String(videoOwnerId).trim();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!video) return null;

    const shareVideo = async (e) => {
        e.preventDefault(); e.stopPropagation();
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/watch/${video._id}`);
            setIsCopied(true);
            setTimeout(() => { setIsCopied(false); setIsMenuOpen(false); }, 2000);
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (e) => {
        if (e) e.stopPropagation();
        setIsUpdating(true);
        try {
            await api.delete(`/videos/${video._id}`);
            if (onVideoUpdate) onVideoUpdate();
        } finally { setIsUpdating(false); setShowDeleteModal(false); }
    };

    const handleToggleStatus = async (e) => {
        e.preventDefault(); e.stopPropagation();
        try {
            await api.patch(`/videos/toggle/publish/${video._id}`);
            if (onVideoUpdate) onVideoUpdate();
            setIsMenuOpen(false);
        } catch (err) { console.error(err); }
    };

    // --- 🚩 NEW: Update Video Handler ---
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        const formData = new FormData();
        formData.append("title", editTitle);
        formData.append("description", editDescription);
        if (newThumbnail) formData.append("thumbnail", newThumbnail);

        try {
            await api.patch(`/videos/${video._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setShowEditModal(false);
            if (onVideoUpdate) onVideoUpdate();
        } catch (error) {
            console.error("Update failed", error);
        } finally { setIsUpdating(false); }
    };

    const formatDuration = (secs) => {
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col gap-3 group relative">
            {/* THUMBNAIL */}
            <Link to={`/watch/${video._id}`} className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-lg">
                <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[11px] font-bold text-white">{formatDuration(video.duration || 0)}</div>
                {!video.isPublished && <div className="absolute top-2 left-2 bg-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Private</div>}
            </Link>

            {/* INFO */}
            <div className="flex gap-3 px-1">
                <Link to={`/c/${video.ownerDetails?.username || video.owner?.username}`} className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                    <img src={video.ownerDetails?.avatar || video.owner?.avatar} className="w-full h-full object-cover" alt="" />
                </Link>
                <div className="flex flex-col flex-1 overflow-hidden">
                    <Link to={`/watch/${video._id}`} className="font-bold text-white text-[14px] line-clamp-2 leading-snug">{video.title}</Link>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">{video.ownerDetails?.username || video.owner?.username} <CheckCircle size={10} /></p>
                    <p className="text-[11px] text-gray-500">{video.views} views • {formatDistanceToNow(new Date(video.createdAt))} ago</p>
                </div>

                {/* 3-DOT MENU */}
                <div ref={menuRef} className="relative">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10"><MoreVertical size={18} /></button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                            <button onClick={shareVideo} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10">
                                <Share2 size={16} className={isCopied ? "text-green-500" : ""} /> {isCopied ? "Copied!" : "Share"}
                            </button>
                            {isOwner && (
                                <>
                                    <div className="h-px bg-white/5 my-1" />
                                    <button onClick={() => { setShowEditModal(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10">
                                        <Edit size={16} /> Edit Details
                                    </button>
                                    <button onClick={handleToggleStatus} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10">
                                        {video.isPublished ? <EyeOff size={16} /> : <Eye size={16} />} {video.isPublished ? "Make Private" : "Make Public"}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10">
                                        <Trash2 size={16} /> Delete Video
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* DELETE MODAL (Keep as is) */}
            {showDeleteModal && (
                 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Delete Video?</h2>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-white hover:bg-white/10 rounded-lg">Cancel</button>
                            <button onClick={handleDelete} className="bg-red-600 px-4 py-2 rounded-lg text-white font-bold">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🚩 RESTORED: EDIT MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-xl flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white">Edit Video Details</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows="4" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary resize-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">New Thumbnail (Optional)</label>
                                <input type="file" accept="image/*" onChange={(e) => setNewThumbnail(e.target.files[0])} className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary cursor-pointer" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2 text-sm text-white hover:bg-white/10 rounded-xl">Cancel</button>
                                <button type="submit" disabled={isUpdating} className="px-5 py-2 text-sm font-bold text-black bg-white rounded-xl flex items-center gap-2">
                                    {isUpdating && <Loader2 size={16} className="animate-spin" />} Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}