import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// 1. Get All Videos (with Search, Sort, and Pagination)
const getAllVideos = asyncHandler(async (req, res) => {
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
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoFileLocalPath) throw new ApiError(400, "Video file is required");
    if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) throw new ApiError(400, "Video upload failed");

    const video = await Video.create({
        title,
        description,
        duration: videoFile.duration,
        videoFile: videoFile.url,
        thumbnail: thumbnail?.url || "",
        owner: req.user?._id, // Matching your UUID string from Auth Middleware
        isPublished: true
    });

    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    );
});

// 3. Get Video By ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId).populate("owner", "username avatar");

    if (!video) throw new ApiError(404, "Video not found");

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});

// 4. Update Video Details
const updateVideo = asyncHandler(async (req, res) => {
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
const deleteVideo = asyncHandler(async (req, res) => {
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
const togglePublishStatus = asyncHandler(async (req, res) => {
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