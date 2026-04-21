import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

// Load your environment variables
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const nukeCloudinaryVideos = async () => {
    try {
        console.log("🔥 Initiating Cloudinary cleanup...");

        // Delete ALL video resources
        console.log("⏳ Deleting all videos...");
        const videoResult = await cloudinary.api.delete_all_resources({
            resource_type: "video"
        });
        
        console.log("✅ Videos wiped:", videoResult.deleted);

         // UNCOMMENT THIS TO DELETE ALL IMAGES (Thumbnails & Avatars)
        // console.log("⏳ Deleting all images...");
        // const imageResult = await cloudinary.api.delete_all_resources({
        //     resource_type: "image"
        // });
        // console.log("✅ Images wiped:", imageResult.deleted);
        

        console.log("🎉 Fresh start ready!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Cleanup Error:", error);
        process.exit(1);
    }
};

nukeCloudinaryVideos();