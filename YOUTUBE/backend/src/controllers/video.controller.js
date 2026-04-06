import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { upload as uploadToCloudinary } from "../utils/clouedinary.js";

// 1. Get All Videos (with Search, Sort, and Pagination)
const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pipeline = [];

    // Filter by Title (Exact match as requested, no Regex)
    if (query) {
        pipeline.push({
            $match: {
                title: query
            }
        });
    }

    // Filter by userId (UUID string match)
    if (userId) {
        pipeline.push({
            $match: {
                owner: userId
            }
        });
    }

    // Only show published videos
    pipeline.push({ $match: { isPublished: true } });

    // Sorting logic
    const sortField = sortBy || "createdAt";
    const sortOrder = sortType === "asc" ? 1 : -1;
    pipeline.push({
        $sort: {
            [sortField]: sortOrder
        }
    });

    // Lookup Owner Details
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                ownerDetails: {
                    username: 1,
                    avatar: 1
                }
            }
        }
    );

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const videoList = await Video.aggregatePaginate(
        Video.aggregate(pipeline),
        options
    );

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

    // 🛡️ SECURITY CHECK: Validate MimeTypes
    // videoFileLocal.mimetype will be something like "video/mp4" or "video/quicktime"
    if (!videoFileLocal.mimetype.startsWith("video/")) {
        throw new ApiError(400, "Invalid format: videoFile must be a video");
    }

    // thumbnailLocal.mimetype will be "image/jpeg", "image/png", etc.
    if (!thumbnailLocal.mimetype.startsWith("image/")) {
        throw new ApiError(400, "Invalid format: thumbnail must be an image");
    }

    const videoFileLocalPath = videoFileLocal.path;
    const thumbnailLocalPath = thumbnailLocal.path;

    // Upload to Cloudinary
    const videoFile = await uploadToCloudinary(videoFileLocalPath);
    const thumbnail = await uploadToCloudinary(thumbnailLocalPath);

    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "Error while uploading files to Cloudinary");
    }

    const video = await Video.create({
        title,
        description,
        duration: videoFile?.duration || 0,
        videoFile: videoFile.url || videoFile,
        thumbnail: thumbnail.url || thumbnail,
        owner: req.user?._id,
        isPublished: true
    });

    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    );
});

// 3. Get Video By ID
const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId).populate("owner", "username avatar");

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

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    // Ownership Check
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request");
    }

    const updateData = { title, description };

    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (thumbnail) updateData.thumbnail = thumbnail.url;
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

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    // Ownership Check
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request");
    }

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

// 6. Toggle Publish Status
const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params;

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
    togglePublishStatus
};