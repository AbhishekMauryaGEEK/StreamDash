import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import VideoUploadModal from './components/video/VideoUploadModal';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile';
import HomeFeed from './pages/HomeFeed';

export default function App() {
    const { user, loading } = useAuth();
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    if (loading) {
        return (
            <div className="h-screen w-full bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {!user ? (
                    <>
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="*" element={<Navigate to="/auth" replace />} />
                    </>
                ) : (
                    <Route
                        path="/*"
                        element={
                            <div className="flex min-h-screen bg-background text-white font-sans">
                                <Sidebar />
                                <div className="flex-1 flex flex-col ml-16 md:ml-64 transition-all duration-300">
                                    <Header onOpenUpload={() => setIsUploadOpen(true)} />
                                    <main className="flex-1 p-6 md:p-8">
                                        <Routes>
                                            <Route path="/" element={<HomeFeed />} />
                                            <Route 
                                                path="/profile" 
                                                element={
                                                    <ProtectedRoute>
                                                        <UserProfile />
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route path="/auth" element={<Navigate to="/" replace />} />
                                            <Route path="*" element={<Navigate to="/" replace />} />
                                        </Routes>
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