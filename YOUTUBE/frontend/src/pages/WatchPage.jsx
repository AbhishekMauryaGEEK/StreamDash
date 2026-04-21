import React, { useEffect, useState ,useRef} from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle,
  ThumbsDown,
  Share2,
  MoreHorizontal,
  Loader2,
  PlusSquare,
} from "lucide-react";
import api from "../utils/axios";
import { formatDistanceToNow } from "date-fns";
import VideoListCard from "../components/common/VideoListCard";
import FollowButton from "../components/follow/FollowButton";
import LikeButton from "../components/common/LikeButton";
import { useAuth } from "../context/AuthContext";
import CommentSection from "../components/comment/CommentSection";
import PlaylistModal from "../components/playlist/PlaylistModal.jsx";

export default function WatchPage() {
  const { user: currentUser } = useAuth();
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Playlist Modal State
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const viewLogged = useRef(false);
  const fetchAllPageData = async () => {
    try {
      setLoading(true);
      const [videoRes, recRes] = await Promise.all([
        api.get(`/videos/${videoId}`),
        api.get("/videos"),
      ]);

      setVideo(videoRes.data.data);
      const allVideos = recRes.data.data.docs || [];
      setRecommendations(allVideos.filter((v) => v._id !== videoId));
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load video");
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
    if (videoId) {
        fetchAllPageData();
    }
    // We do NOT reset viewLogged here
}, [videoId]);

// 2. Second Effect: Only handles the 5-second view timer
useEffect(() => {
    // Reset the ref only when the videoId actually changes
    const viewTimer = setTimeout(() => {
        if (videoId && !viewLogged.current) {
            const logView = async () => {
                try {
                    await api.patch(`/videos/v/view/${videoId}`);
                    viewLogged.current = true; 
                } catch (err) {
                    console.error("View failed to log", err);
                }
            };
            logView();
        }
    }, 5000);

    return () => {
        clearTimeout(viewTimer);
        // Important: Don't reset viewLogged.current here if it's 
        // just a re-render. Only reset if the videoId changes.
    };
}, [videoId]);

  if (loading)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );

  if (error || !video)
    return (
      <div className="flex h-[80vh] items-center justify-center text-white p-4">
        <div className="bg-red-500/10 p-8 rounded-3xl border border-red-500/20 text-center">
          <p className="text-xl font-bold mb-2">Error</p>
          <p className="text-gray-400">{error}</p>
          <Link
            to="/"
            className="mt-4 inline-block bg-white text-black px-6 py-2 rounded-full font-bold"
          >
            Back Home
          </Link>
        </div>
      </div>
    );

  const channel = video.owner;

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 lg:p-10 max-w-[1700px] mx-auto min-h-screen">
      {/* Left Column: Video + Details + Comments */}
      <div className="flex-1 min-w-0">
        {/* Player Section */}
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10">
          <video
            src={video.videoFile}
            controls
            autoPlay
            className="w-full h-full"
            poster={video.thumbnail}
          />
        </div>

        <div className="mt-6 space-y-5">
          <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight">
            {video.title}
          </h1>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <Link to={`/c/${channel?.username}`}>
                <img
                  src={channel?.avatar}
                  className="w-12 h-12 rounded-full object-cover border border-white/10"
                  alt="avatar"
                />
              </Link>
              <div>
                <Link
                  to={`/c/${channel?.username}`}
                  className="flex items-center gap-1 font-bold text-white hover:text-primary transition"
                >
                  {channel?.username}{" "}
                  <CheckCircle size={14} className="text-primary" />
                </Link>
                <p className="text-xs text-gray-400">
                  {channel?.subscribersCount || 0} followers
                </p>
              </div>

              {currentUser?._id !== channel?._id && (
                <div className="ml-2">
                  <FollowButton
                    userId={channel?._id}
                    initialIsFollowed={channel?.isSubscribed}
                  />
                </div>
              )}
            </div>

            {/* Video Controls */}
            <div className="flex items-center gap-3">
              {/* Like/Dislike Group */}
              <div className="flex items-center bg-white/5 p-1 rounded-full border border-white/10">
                <LikeButton
                  id={video._id}
                  type="v"
                  initialIsLiked={video.isLiked}
                  initialCount={video.likesCount}
                />
                <button className="px-4 py-2 text-white hover:bg-white/10 rounded-r-full border-l border-white/10 transition">
                  <ThumbsDown size={18} />
                </button>
              </div>

              {/* Save to Playlist Button */}
              <button
                onClick={() => setIsPlaylistModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition font-bold text-sm"
              >
                <PlusSquare size={18} className="text-primary" />
                <span>Save</span>
              </button>

              {/* Share & More */}
              <button className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition font-bold text-sm">
                <Share2 size={18} />
                <span>Share</span>
              </button>

              <button className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Description Box */}
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:bg-white/[0.07] transition-all group">
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <span>{video.views.toLocaleString()} views</span>
              <span className="text-gray-500">•</span>
              <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {video.description}
            </p>
          </div>

          {/* Comment Section */}
          <div className="pt-6">
            <CommentSection videoId={videoId} />
          </div>
        </div>
      </div>

      {/* Right Column: Recommendations */}
      <div className="lg:w-[400px] shrink-0 space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-white text-lg">Up Next</h3>
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
            Autoplay ON
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <VideoListCard key={rec._id} video={rec} />
            ))
          ) : (
            <p className="text-gray-500 text-sm italic px-2">
              No recommendations found.
            </p>
          )}
        </div>
      </div>

      {/* Playlist Selection Modal Overlay */}
      {isPlaylistModalOpen && (
        <PlaylistModal
          videoId={videoId}
          onClose={() => setIsPlaylistModalOpen(false)}
        />
      )}
    </div>
  );
}
