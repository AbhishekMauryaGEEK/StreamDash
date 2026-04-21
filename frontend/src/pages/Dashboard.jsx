import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import EditVideoModal from "../components/dashboard/EditVideoModal";
import {
  BarChart3,
  Eye,
  Heart,
  Users,
  Edit3,
  Trash2,
  ExternalLink,
  Loader2,
  Play,
} from "lucide-react";
import { Link } from "react-router-dom";
// Import the secure delete modal
import DeleteConfirmModal from "../components/dashboard/DeleteConfirmModal";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoToEdit, setVideoToEdit] = useState(null);
  // High-Security Delete State
  const [videoToDelete, setVideoToDelete] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const [statsRes, videosRes] = await Promise.all([
        api.get(`/dashboard/stats/${user._id}`),
        api.get(`/dashboard/videos/${user._id}`),
      ]);
      setStats(statsRes.data.data);
      setVideos(videosRes.data.data);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);
  const handleUpdateAction = async (updatedData) => {
    try {
      // updatedData will be a FormData object if you're changing the thumbnail
      const res = await api.patch(`/videos/${videoToEdit._id}`, updatedData);

      // Update the local list so the UI changes instantly
      setVideos((prev) =>
        prev.map((v) => (v._id === videoToEdit._id ? res.data.data : v)),
      );
      setVideoToEdit(null);
    } catch (err) {
      console.error("Update failed", err);
    }
  };
  const handleDeleteAction = async () => {
    if (!videoToDelete) return;
    try {
      await api.delete(`/videos/${videoToDelete._id}`);
      // Optimistic Update: Remove from list immediately
      setVideos((prev) => prev.filter((v) => v._id !== videoToDelete._id));
      setVideoToDelete(null);
      // Refresh global stats to reflect the missing views/likes
      fetchDashboardData();
    } catch (err) {
      console.error("Deletion failed", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading)
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
            Control Center
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-4">
            Operator: <span className="text-primary">{user?.username}</span> //
            System Live
          </p>
        </div>
      </header>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Eye}
          label="Total Views"
          value={stats?.totalViews || 0}
          color="text-blue-400"
        />
        <StatCard
          icon={Users}
          label="Followers"
          value={stats?.totalSubscribers || 0}
          color="text-primary"
        />
        <StatCard
          icon={Heart}
          label="Total Likes"
          value={stats?.totalLikes || 0}
          color="text-red-400"
        />
        <StatCard
          icon={BarChart3}
          label="Engagement Rate"
          value={
            stats?.totalViews > 0
              ? ((stats.totalLikes / stats.totalViews) * 100).toFixed(1)
              : 0
          }
          color="text-purple-400"
          isPercent
        />
      </div>

      {/* Video Management Section */}
      <div className="glass border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h2 className="text-2xl font-black italic uppercase text-white tracking-tight">
            Your Content
          </h2>
          <div className="px-4 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {videos.length} Artifacts Uploaded
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.3em] text-gray-600 border-b border-white/5 bg-white/[0.01]">
                <th className="p-6 font-black">Status</th>
                <th className="p-6 font-black">Video</th>
                <th className="p-6 font-black">Performance</th>
                <th className="p-6 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {videos.map((video) => (
                <tr
                  key={video._id}
                  className="group hover:bg-white/[0.02] transition-all"
                >
                  <td className="p-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        video.isPublished
                          ? "border-green-500/20 text-green-500 bg-green-500/5"
                          : "border-gray-500/20 text-gray-500 bg-gray-500/5"
                      }`}
                    >
                      {video.isPublished ? "Public" : "Draft"}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/watch/${video._id}`}
                        className="relative w-24 aspect-video rounded-xl overflow-hidden border border-white/10 shrink-0 block"
                      >
                        <img
                          src={video.thumbnail}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          alt=""
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play size={16} className="text-white fill-white" />
                        </div>
                      </Link>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white truncate max-w-[250px]">
                          {video.title}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase mt-1">
                          {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-6 text-xs font-bold uppercase tracking-tighter">
                      <span className="text-blue-400/80 flex items-center gap-1.5">
                        <Eye size={12} /> {video.views}
                      </span>
                      <span className="text-red-400/80 flex items-center gap-1.5">
                        <Heart size={12} /> {video.likesCount || 0}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => setVideoToEdit(video)}
                        className="p-2.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition shadow-lg"
                      >
                        <Edit3 size={16} />
                      </button>
                      <Link
                        to={`/watch/${video._id}`}
                        className="p-2.5 hover:bg-primary/10 rounded-xl text-gray-400 hover:text-primary transition shadow-lg"
                        title="View Video"
                      >
                        <ExternalLink size={16} />
                      </Link>
                      <button
                        onClick={() => setVideoToDelete(video)}
                        className="p-2.5 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-500 transition shadow-lg"
                        title="Delete Permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* High-Security Delete Modal Overlay */}
      {videoToDelete && (
        <DeleteConfirmModal
          videoTitle={videoToDelete.title}
          onClose={() => setVideoToDelete(null)}
          onConfirm={handleDeleteAction}
        />
      )}
      {videoToEdit && (
        <EditVideoModal
          video={videoToEdit}
          onClose={() => setVideoToEdit(null)}
          onSave={handleUpdateAction}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, isPercent }) {
  return (
    <div className="glass border border-white/10 p-8 rounded-[2.5rem] space-y-6 hover:border-primary/40 transition-all group relative overflow-hidden">
      <div
        className={`p-4 rounded-2xl bg-white/[0.03] w-fit border border-white/5 ${color} group-hover:scale-110 transition-transform duration-500`}
      >
        <Icon size={28} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1">
          {label}
        </p>
        <h3 className="text-4xl font-black text-white italic tracking-tighter">
          {value.toLocaleString()}
          {isPercent ? "%" : ""}
        </h3>
      </div>
      <div
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent w-full opacity-20 ${color}`}
      />
    </div>
  );
}
