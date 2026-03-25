import React, { useRef, useState } from 'react';
import { X, UploadCloud } from 'lucide-react';
import api from '../../utils/axios';

const VideoUploadModal = ({ onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const videoFileRef = useRef(null);
    const thumbnailRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        setError(null);

        // Explicitly build the FormData object
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
            // Send to your backend
            const response = await api.post("/videos", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("Upload Success:", response.data);
            onClose();
        } catch (error) {
            console.error("Upload Error:", error.response?.data || error.message);
            setError(error.response?.data?.message || "An error occurred during upload.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass w-full max-w-2xl p-8 rounded-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-white">Upload Video</h2>

                {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-500 rounded-lg">{error}</div>}

                <form onSubmit={handleUpload} className="space-y-5">
                    <input 
                        type="text" 
                        placeholder="Video Title" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full p-4 bg-surface border border-border rounded-xl text-white outline-none focus:border-primary/50 transition-colors" 
                    />
                    <textarea 
                        placeholder="Video Description" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full h-32 p-4 bg-surface border border-border rounded-xl text-white outline-none focus:border-primary/50 transition-colors resize-none" 
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                            <label className="block text-sm text-gray-400 mb-2">Video File</label>
                            <input 
                                ref={videoFileRef} 
                                type="file" 
                                accept="video/*" 
                                required
                                className="w-full p-3 bg-surface border border-border rounded-xl text-gray-400 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-red-600" 
                            />
                        </div>
                        <div className="relative group">
                            <label className="block text-sm text-gray-400 mb-2">Thumbnail Image</label>
                            <input 
                                ref={thumbnailRef} 
                                type="file" 
                                accept="image/*" 
                                required
                                className="w-full p-3 bg-surface border border-border rounded-xl text-gray-400 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-red-600" 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isUploading}
                        className="w-full p-4 font-bold bg-primary text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isUploading ? 'Uploading...' : <><UploadCloud className="w-5 h-5" /> Upload Video</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VideoUploadModal;