import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import LikeButton from '../common/LikeButton';
import { useAuth } from '../../context/AuthContext';

export default function CommentCard({ comment, onDelete }) {
    const { user: currentUser } = useAuth();
    
    // Check if current user is the author of the comment
    const isOwner = currentUser?._id === comment.ownerDetails?._id || currentUser?._id === comment.owner;

    return (
        <div className="flex gap-4 group">
            <img 
                src={comment.ownerDetails?.avatar} 
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/5" 
                alt="avatar" 
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">@{comment.ownerDetails?.username}</span>
                        <span className="text-[10px] text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                    </div>
                    {isOwner && (
                        <button 
                            onClick={() => onDelete(comment._id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-500 transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
                <p className="text-sm text-gray-300 mt-1 leading-relaxed break-words">
                    {comment.content}
                </p>
                <div className="mt-2">
                    <LikeButton 
                        id={comment._id}
                        type="c" // 'c' tells backend this is a comment like
                        initialIsLiked={comment.isLiked}
                        initialCount={comment.likesCount}
                        size={14}
                    />
                </div>
            </div>
        </div>
    );
}