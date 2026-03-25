import React from 'react';

const VideoCard = () => {
    return (
        <div className="glass rounded-xl overflow-hidden cursor-pointer group hover:-translate-y-1 transition-transform duration-300">
            {/* Thumbnail Placeholder */}
            <div className="w-full aspect-video bg-surface relative">
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                    10:23
                </div>
            </div>
            
            <div className="p-4 flex gap-3">
                {/* Avatar Placeholder */}
                <div className="w-10 h-10 rounded-full bg-primary shrink-0" />
                
                <div className="flex flex-col">
                    <h3 className="text-white font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        Cinematic Title Example Placeholder
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Channel Name</p>
                    <div className="text-gray-400 text-xs flex gap-1 mt-1">
                        <span>1.2M views</span>
                        <span>•</span>
                        <span>2 days ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;