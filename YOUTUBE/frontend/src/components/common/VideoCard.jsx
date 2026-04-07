import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, CheckCircle, Edit, Trash2, Eye, EyeOff, Share2, X, Loader2, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';

export default function VideoCard({ video, currentUser, onVideoUpdate }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Edit Form State
    const [editTitle, setEditTitle] = useState(video?.title || "");
    const [editDescription, setEditDescription] = useState(video?.description || "");
    const [newThumbnail, setNewThumbnail] = useState(null);
    
    // share video
    const [isCopied, setIsCopied] = useState(false);
    const menuRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!video) return null;

    const { thumbnail, title, ownerDetails, views = 0, createdAt, duration = 0, _id } = video;

    // Check if the current logged-in user owns this video
    const isOwner = currentUser?._id === ownerDetails?._id;

    // --- Formatters ---
    const formatDuration = (totalSeconds) => {
        const secs = Math.floor(Number(totalSeconds));
        if (isNaN(secs) || secs <= 0) return "0:00";
        const minutes = Math.floor(secs / 60);
        const seconds = secs % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatViews = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count;
    };

    const getTimeAgo = (date) => {
        try {
            return formatDistanceToNow(new Date(date)) + " ago";
        } catch {
            return "recently";
        }
    };

    // --- Handlers ---
    const handleDelete = async () => {
        setIsUpdating(true);
        try {
            await api.delete(`/videos/${_id}`);
            setShowDeleteModal(false);
            if (onVideoUpdate) onVideoUpdate();
        } catch (error) {
            console.error("Failed to delete video", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            await api.patch(`/videos/toggle/publish/${_id}`);
            setIsMenuOpen(false);
            if (onVideoUpdate) onVideoUpdate();
        } catch (error) {
            console.error("Failed to toggle status", error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        const formData = new FormData();
        formData.append("title", editTitle);
        formData.append("description", editDescription);
        if (newThumbnail) {
            formData.append("thumbnail", newThumbnail);
        }

        try {
            await api.patch(`/videos/${_id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setShowEditModal(false);
            if (onVideoUpdate) onVideoUpdate();
        } catch (error) {
            console.error("Failed to update video", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // 🚀 FIX: Capitalized the V so it matches onClick={shareVideo}
    const shareVideo = async (e) => {
        e.preventDefault();
        const shareUrl = `${window.location.origin}/watch/${_id}`; // Added semicolon
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);

            setTimeout(() => {
                setIsCopied(false);
                setIsMenuOpen(false);
            }, 2000);
        }
        catch (error) {
            console.log("Failed to copy the url", error);
        }
    };

    return (
        <div className="flex flex-col gap-3 group animate-in fade-in duration-500 relative">
            {/* THUMBNAIL CONTAINER - Clicking this goes to the Watch Page */}
            <Link to={`/watch/${_id}`} className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-lg block">
                <img
                    src={thumbnail}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-lg border border-white/10 shadow-xl">
                    {formatDuration(duration)}
                </div>
                {!video.isPublished && (
                    <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-md text-white text-[10px] uppercase font-black px-2 py-1 rounded border border-white/20">
                        Private
                    </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* META DATA */}
            <div className="flex gap-3 px-1 items-start">

                {/* 1. Channel Avatar */}
                <Link to={`/c/${ownerDetails?.username}`} className="flex-shrink-0 pt-1">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:border-primary/50 transition-colors duration-300">
                        <img
                            src={ownerDetails?.avatar || 'https://via.placeholder.com/40'}
                            className="w-full h-full object-cover"
                            alt={ownerDetails?.username}
                        />
                    </div>
                </Link>

                {/* 2. Text Content (This keeps overflow-hidden for text truncation) */}
                <div className="flex flex-col flex-1 overflow-hidden pr-2">
                    <Link to={`/watch/${_id}`} className="font-bold text-[15px] leading-snug text-white line-clamp-2 hover:text-primary transition-colors duration-300 cursor-pointer pt-1">
                        {title}
                    </Link>

                    <div className="mt-1 space-y-0.5">
                        <Link to={`/c/${ownerDetails?.username}`} className="flex items-center gap-1 group/channel w-fit">
                            <p className="text-xs text-gray-400 group-hover/channel:text-white transition-colors truncate">
                                {ownerDetails?.username || "Unknown"}
                            </p>
                            <CheckCircle size={10} className="text-gray-500 fill-gray-500/20" />
                        </Link>
                        <p className="text-[11px] text-gray-500 font-medium">
                            {formatViews(views)} views • {getTimeAgo(createdAt)}
                        </p>
                    </div>
                </div>

                {/* 3. 3-DOT MENU (Moved OUTSIDE the overflow-hidden div!) */}
                <div ref={menuRef} className="relative flex-shrink-0 pt-0.5 z-20">
                    <button onClick={(e) => { e.preventDefault(); setIsMenuOpen(!isMenuOpen); }} className="text-gray-500 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
                        <MoreVertical size={16} />
                    </button>

                    {/* DROPDOWN MENU */}
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                            <button
                                onClick={shareVideo}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition"
                            >
                                {/* If it's copied, show a checkmark. Otherwise, show the Share icon */}
                                {isCopied ? <CheckCircle size={16} className="text-green-500" /> : <Share2 size={16} />}
                                {isCopied ? <span className="text-green-500">Link Copied!</span> : "Share"}
                            </button>

                            {isOwner && (
                                <>
                                    <div className="h-px bg-white/10 my-1"></div>
                                    <button onClick={(e) => { e.preventDefault(); setShowEditModal(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition">
                                        <Edit size={16} /> Edit Details
                                    </button>
                                    <button onClick={(e) => { e.preventDefault(); handleToggleStatus(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition">
                                        {video.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                                        {video.isPublished ? "Make Private" : "Make Public"}
                                    </button>
                                    <div className="h-px bg-white/10 my-1"></div>
                                    <button onClick={(e) => { e.preventDefault(); setShowDeleteModal(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition">
                                        <Trash2 size={16} /> Delete Video
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* --- DELETE MODAL --- */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm px-4">
                    <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-2">Delete this video?</h2>
                        <p className="text-gray-400 text-sm mb-6">This action is permanent. The video file and thumbnail will be wiped from the servers.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDeleteModal(false)} disabled={isUpdating} className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition disabled:opacity-50">Cancel</button>
                            <button onClick={handleDelete} disabled={isUpdating} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 disabled:opacity-50">
                                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- EDIT MODAL --- */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm px-4">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white">Edit Video Details</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Title</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows="4"
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">New Thumbnail (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewThumbnail(e.target.files[0])}
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition cursor-pointer"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} disabled={isUpdating} className="px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 rounded-xl transition disabled:opacity-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isUpdating} className="px-5 py-2.5 text-sm font-bold text-black bg-white hover:bg-gray-200 rounded-xl flex items-center gap-2 transition disabled:opacity-50">
                                    {isUpdating && <Loader2 size={16} className="animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}