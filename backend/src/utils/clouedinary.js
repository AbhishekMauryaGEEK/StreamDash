import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Extract Public ID (handles folders and version tags automatically)
const extractPublicId = (fileUrl) => {
    if (!fileUrl) return null;
    const parts = fileUrl.split('/upload/');
    if (parts.length < 2) return null;
    
    const pathParts = parts[1].split('/');
    // Remove the version tag (e.g., v171123456) if it exists
    if (pathParts[0].startsWith('v') && !isNaN(pathParts[0].substring(1))) {
        pathParts.shift(); 
    }
    
    const publicIdWithExt = pathParts.join('/');
    return publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
};

const upload = async (localFilePath, folderName = "streamdash/general") => {
    try {
        if (!localFilePath) return null;

        const transfer = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: folderName //  Routes file to the correct folder
        });

        console.log(` Cloudinary Upload Success [${folderName}]:`, transfer.url);
        if (transfer.duration) console.log("⏱️ Detected Duration:", transfer.duration);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log(" Local file deleted successfully");
        }

        return transfer;

    } catch (error) {
        console.error(" Cloudinary Upload Error:", error.message);
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteFromCloudinary = async (fileUrl, resourceType = "image") => {
    try {
        const publicId = extractPublicId(fileUrl);
        if (!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        console.log(` Deleted from Cloudinary [${resourceType}]:`, publicId);
        return response;

    } catch (error) {
        console.error(` Error deleting from Cloudinary:`, error.message);
        return null;
    }
}

export { upload, deleteFromCloudinary };