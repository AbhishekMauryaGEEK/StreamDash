import React, { useRef, useState } from 'react';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import api from '../../utils/axios';

const VideoUploadModal = ({ onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const videoFileRef = useRef(null);
    const thumbnailRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); // 👈 New Progress State
    const [error, setError] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        setError(null);
        setUploadProgress(0); // Reset progress

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);

        if (videoFileRef.current?.files[0]) {
            formData.append("videoFile", videoFileRef.current.files[0]);
        } else {
            setError("Video file is required");
            setIsUploading(false);
            return;
        }

        if (thumbnailRef.current?.files[0]) {
            formData.append("thumbnail", thumbnailRef.current.files[0]);
        } else {
            setError("Thumbnail is required");
            setIsUploading(false);
            return;
        }
        try {
            const response = await api.post("/videos", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                // 📊 THE MAGIC HAPPENS HERE
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                },
            });

            console.log("Upload Success:", response.data);
            alert("Video uploaded successfully!");
            onClose();
        } catch (error) {
            console.error("Upload Error:", error.response?.data || error.message);
            setError(error.response?.data?.message || "An error occurred during upload.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass w-full max-w-2xl p-8 rounded-[2rem] relative bg-[#121212] border border-white/10 shadow-2xl">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    <UploadCloud className="text-primary" /> Upload Video
                </h2>

                {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl text-sm">{error}</div>}

                <form onSubmit={handleUpload} className="space-y-5">
                    {/* Progress Bar Section */}
                    {isUploading && (
                        <div className="space-y-2 animate-in fade-in duration-300">
                            <div className="flex justify-between text-sm">
                                <span className="text-primary font-medium">Uploading to Cloudinary...</span>
                                <span className="text-gray-400">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
                                <div
                                    className="bg-primary h-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <input
                        type="text" placeholder="Video Title"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                        required disabled={isUploading}
                        className="w-full p-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white outline-none focus:border-primary/50 transition-colors"
                    />

                    <textarea
                        placeholder="Video Description"
                        value={description} onChange={(e) => setDescription(e.target.value)}
                        required disabled={isUploading}
                        className="w-full h-32 p-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white outline-none focus:border-primary/50 transition-colors resize-none"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 ml-1">Video File</label>
                            <input
                                ref={videoFileRef} type="file" accept="video/*"
                                required disabled={isUploading}
                                className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 ml-1">Thumbnail</label>
                            <input
                                ref={thumbnailRef} type="file" accept="image/*"
                                required disabled={isUploading}
                                className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full p-4 font-bold bg-primary text-white rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isUploading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Finalizing...</>
                        ) : (
                            <><UploadCloud className="w-5 h-5" /> Publish Video</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VideoUploadModal;