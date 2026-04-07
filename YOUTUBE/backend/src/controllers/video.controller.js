import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asyncHandler.js";
//  Import the newly added delete function
import { upload as uploadToCloudinary, deleteFromCloudinary } from "../utils/clouedinary.js";

// 1. Get All Videos
const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pipeline = [];

    // 1. Filter by userId (Channel Page)
    if (userId) {
        const matchQuery = isValidObjectId(userId)
            ? new mongoose.Types.ObjectId(userId)
            : userId;

        pipeline.push({
            $match: { owner: matchQuery }
        });
    }

    // 2. Filter by Search Query
    if (query) {
        pipeline.push({
            $match: { title: { $regex: query, $options: "i" } }
        });
    }

    // 🛡️ 3. SMART PRIVACY LOGIC
    // We only force videos to be "published" IF:
    // A) We are on the general Home Feed (no userId provided)
    // B) We are on a Channel Page, but the logged-in user is NOT the owner
    if (!userId || (req.user?._id?.toString() !== userId.toString())) {
        pipeline.push({ $match: { isPublished: true } });
    }

    // 4. Get Owner Details
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: {
                path: "$ownerDetails",
                preserveNullAndEmptyArrays: true
            }
        }
    );

    // 5. Select only the necessary fields
    pipeline.push({
        $project: {
            videoFile: 1,
            thumbnail: 1,
            title: 1,
            description: 1,
            views: 1,
            duration: 1,
            createdAt: 1,
            isPublished: 1, //  Added this so your frontend knows which ones are private!
            ownerDetails: {
                username: 1,
                avatar: 1,
                fullname: 1
            }
        }
    });

    // 6. Sorting & Pagination
    const sortField = sortBy || "createdAt";
    const sortOrder = sortType === "asc" ? 1 : -1;

    const aggregate = Video.aggregate(pipeline).sort({ [sortField]: sortOrder });

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const videoList = await Video.aggregatePaginate(aggregate, options);

    if (!videoList) {
        throw new ApiError(500, "Error while fetching videos");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videoList, "Videos fetched successfully"));
});

// 2. Publish a Video
const publishAVideo = asynchandler(async (req, res) => {
    const { title, description } = req.body;

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const videoFileLocal = req.files?.videoFile?.[0];
    const thumbnailLocal = req.files?.thumbnail?.[0];

    if (!videoFileLocal) throw new ApiError(400, "Video file is required");
    if (!thumbnailLocal) throw new ApiError(400, "Thumbnail is required");

    if (!videoFileLocal.mimetype.startsWith("video/")) {
        throw new ApiError(400, "Invalid format: videoFile must be a video");
    }

    if (!thumbnailLocal.mimetype.startsWith("image/")) {
        throw new ApiError(400, "Invalid format: thumbnail must be an image");
    }

    const videoFileLocalPath = videoFileLocal.path;
    const thumbnailLocalPath = thumbnailLocal.path;

    // 📁 Upload to Cloudinary with explicit Folder Names
    const videoFile = await uploadToCloudinary(videoFileLocalPath, "streamdash/videos");
    const thumbnail = await uploadToCloudinary(thumbnailLocalPath, "streamdash/thumbnails");

    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "Error while uploading files to Cloudinary");
    }

    const video = await Video.create({
        title,
        description,
        duration: videoFile?.duration || 0,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        owner: req.user?._id,
        isPublished: true,
        views: 0
    });

    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    );
});

// 3. Get Video By ID
const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");

    const video = await Video.findById(videoId).populate("owner", "username avatar fullname");

    if (!video) throw new ApiError(404, "Video not found");

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});

// 4. Update Video Details
const updateVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request");
    }

    const updateData = { title, description };

    // 🧹 Replace Thumbnail Logic
    if (thumbnailLocalPath) {
        const oldThumbnailUrl = video.thumbnail;

        // Upload new thumbnail to the designated folder
        const newThumbnail = await uploadToCloudinary(thumbnailLocalPath, "streamdash/thumbnails");

        if (newThumbnail) {
            updateData.thumbnail = newThumbnail.url;
            // Delete the old thumbnail from Cloudinary to save space
            await deleteFromCloudinary(oldThumbnailUrl, "image");
        } else {
            throw new ApiError(500, "Failed to upload new thumbnail");
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateData },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
});

// 5. Delete Video
const deleteVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request");
    }

    // 🧹 Delete both assets from Cloudinary before wiping the DB record
    await deleteFromCloudinary(video.videoFile, "video");
    await deleteFromCloudinary(video.thumbnail, "image");

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Video and assets deleted successfully")
    );
});

// 6. Toggle Publish Status
const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request");
    }

    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, { isPublished: video.isPublished }, "Status toggled")
    );
});
export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
