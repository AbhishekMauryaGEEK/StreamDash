import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // 1. Upload to Cloudinary
        const transfer = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log(" Cloudinary Upload Success:", transfer.url);

        // 2. Attempt to Delete Local File
        try {
            fs.unlinkSync(localFilePath);
            console.log("🗑️ Local file deleted successfully");
        } catch (deleteError) {
            // This will print WHY the file isn't deleting
            console.error(" DELETION ERROR:", deleteError.message);
        }

        return transfer.url;

    } catch (error) {
        // Handle Cloudinary Upload Errors
        console.error(" Cloudinary Error:", error.message);

        // Retry deletion if upload failed
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
                console.log("🗑️ Local file deleted after error");
            }
        } catch (unlinkError) {
            console.error("DELETION ERROR (Clean up):", unlinkError.message);
        }

        return null;
    }
}

export { upload };