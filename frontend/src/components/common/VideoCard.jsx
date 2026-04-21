import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import { 
    MoreVertical, CheckCircle, Trash2, Edit,
    Eye, EyeOff, Share2, Loader2, X, Play 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';

export default function VideoCard({ video, currentUser, onVideoUpdate }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    
    const [editTitle, setEditTitle] = useState(video?.title || "");
    const [editDescription, setEditDescription] = useState(video?.description || "");
    const [newThumbnail, setNewThumbnail] = useState(null);

    const menuRef = useRef(null);

    // Ownership logic
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

    // Actions (Share, Toggle, Delete, Edit) ... [Your logic here is fine]
    const shareVideo = async (e) => {
        e.preventDefault(); e.stopPropagation();
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/watch/${video._id}`);
            setIsCopied(true);
            setTimeout(() => { setIsCopied(false); setIsMenuOpen(false); }, 2000);
        } catch (err) { console.error(err); }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        const formData = new FormData();
        formData.append("title", editTitle);
        formData.append("description", editDescription);
        if (newThumbnail) formData.append("thumbnail", newThumbnail);
        try {
            await api.patch(`/videos/${video._id}`, formData);
            setShowEditModal(false);
            if (onVideoUpdate) onVideoUpdate();
        } catch (error) { console.error(error); } finally { setIsUpdating(false); }
    };

    const formatDuration = (secs) => {
        const mins = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${mins}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="flex flex-col gap-3 group relative"
        >
            {/* THUMBNAIL AREA */}
            <div className="relative aspect-video rounded-[1.5rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
                <Link to={`/watch/${video._id}`} className="block w-full h-full">
                    <motion.img 
                        src={video.thumbnail} 
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                        className="w-full h-full object-cover" 
                        alt={video.title} 
                    />
                    
                    {/* Play Overlay - Brutalist Style */}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <motion.div 
                            initial={{ scale: 0.5 }}
                            whileHover={{ scale: 1.1 }}
                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl"
                        >
                            <Play className="text-black fill-current ml-1" size={20} />
                        </motion.div>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-white tracking-widest uppercase">
                        {formatDuration(video.duration || 0)}
                    </div>
                    
                    {!video.isPublished && (
                        <div className="absolute top-3 left-3 bg-primary text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">
                            Private Artifact
                        </div>
                    )}
                </Link>
            </div>

            {/* INFO AREA */}
            <div className="flex gap-3 px-1">
                <Link to={`/c/${video.ownerDetails?.username}`} className="shrink-0">
                    <motion.img 
                        whileHover={{ scale: 1.1 }}
                        src={video.ownerDetails?.avatar || video.owner?.avatar} 
                        className="w-10 h-10 rounded-full object-cover border border-white/10" 
                        alt="" 
                    />
                </Link>
                
                <div className="flex flex-col flex-1 overflow-hidden">
                    <Link to={`/watch/${video._id}`} className="font-black text-white text-[14px] line-clamp-2 leading-tight uppercase tracking-tight italic group-hover:text-primary transition-colors">
                        {video.title}
                    </Link>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                        {video.ownerDetails?.username} <CheckCircle size={10} className="text-primary" />
                    </p>
                    <p className="text-[10px] text-gray-600 font-medium">
                        {video.views} nodes • {formatDistanceToNow(new Date(video.createdAt))} ago
                    </p>
                </div>

                {/* 3-DOT MENU */}
                <div ref={menuRef} className="relative">
                    <button 
                        onClick={(e) => { e.preventDefault(); setIsMenuOpen(!isMenuOpen); }} 
                        className="p-1 text-gray-600 hover:text-white rounded-full hover:bg-white/5 transition-all"
                    >
                        <MoreVertical size={18} />
                    </button>
                    
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 mt-2 w-48 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                            >
                                <button onClick={shareVideo} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all uppercase tracking-widest">
                                    <Share2 size={14} className={isCopied ? "text-green-500" : ""} /> 
                                    {isCopied ? "Encrypted Link Copied" : "Share Artifact"}
                                </button>
                                {isOwner && (
                                    <>
                                        <div className="h-px bg-white/5 my-1" />
                                        <button onClick={() => { setShowEditModal(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all uppercase tracking-widest">
                                            <Edit size={14} /> Update Data
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-all uppercase tracking-widest">
                                            <Trash2 size={14} /> Purge Artifact
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* MODALS (Delete & Edit) */}
            {/* ... Keep your modal code here, but wrap the internal div in <motion.div> for smooth pop-ups! */}
        </motion.div>
    );
}