import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function VideoListCard({ video }) {
    if (!video) return null;

    return (
        <Link to={`/watch/${video._id}`} className="flex gap-3 group">
            {/* Thumbnail */}
            <div className="relative w-40 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-white/5">
                <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1 overflow-hidden">
                <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {video.title}
                </h4>
                <p className="text-[11px] text-gray-400 font-medium truncate">
                    {video.owner?.username || video.ownerDetails?.username}
                </p>
                <p className="text-[10px] text-gray-500">
                    {video.views} views • {formatDistanceToNow(new Date(video.createdAt))} ago
                </p>
            </div>
        </Link>
    );
}