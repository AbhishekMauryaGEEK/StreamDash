import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

// Components & Pages
import Sidebar from "./components/common/Sidebar";
import Header from "./components/common/Header";
import VideoUploadModal from "./components/video/VideoUploadModal";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import UserProfile from "./pages/UserProfile";
import HomeFeed from "./pages/HomeFeed";
import Settings from "./pages/Settings";
import ChannelPage from "./pages/ChannelPage";
import WatchPage from "./pages/WatchPage";
import FollowingPage from "./pages/FollowingPage";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import Dashboard from "./pages/Dashboard";

// The "Artifact" Page Transition Wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15, filter: "blur(12px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, y: -15, filter: "blur(12px)" }}
    transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }} // Heavy brutalist ease
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

// We define this component here so useLocation() can be inside the Router context
function AnimatedRoutes({ onOpenUpload }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><HomeFeed /></PageWrapper>} />
        <Route path="/watch/:videoId" element={<PageWrapper><WatchPage /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
        <Route path="/c/:username" element={<PageWrapper><ChannelPage /></PageWrapper>} />
        <Route path="/following" element={<PageWrapper><FollowingPage /></PageWrapper>} />
        <Route path="/playlists" element={<PageWrapper><Playlists /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/playlist/:playlistId" element={<PageWrapper><PlaylistDetail /></PageWrapper>} />
        <Route path="/profile" element={<ProtectedRoute><PageWrapper><UserProfile /></PageWrapper></ProtectedRoute>} />
        {/* Force authenticated users home if they try to access /auth */}
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("streamdash-theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="rounded-full h-10 w-10 border-t-2 border-primary" 
        />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Authenticated Flow vs. Public Flow */}
        {!user ? (
          <>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        ) : (
          <Route
            path="/*"
            element={
              <div className="flex min-h-screen bg-background text-white font-sans overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col ml-16 md:ml-64 transition-all duration-500 ease-in-out">
                  <Header onOpenUpload={() => setIsUploadOpen(true)} />
                  <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <AnimatedRoutes onOpenUpload={() => setIsUploadOpen(true)} />
                  </main>
                </div>
                {isUploadOpen && (
                  <VideoUploadModal onClose={() => setIsUploadOpen(false)} />
                )}
              </div>
            }
          />
        )}
      </Routes>
    </Router>
  );
}