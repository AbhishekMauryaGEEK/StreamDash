import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Follow } from "../models/follow.model.js"; // Using your Follow model name
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asyncHandler.js";

const getChannelStats = asynchandler(async (req, res) => {
    const { channelId } = req.params;

    // 1. Get Total Views and Total Videos
    const videoStats = await Video.aggregate([
        { $match: { owner: channelId } },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalVideos: { $count: {} },
                videoIds: { $push: "$_id" } // Collect all video IDs for the next step
            }
        }
    ]);

    const userVideoIds = videoStats[0]?.videoIds || [];

    // 2. Get Total Likes (Atomic Match)
    // We count every Like document where the 'video' field is in our list of videoIds
    const totalLikesCount = await Like.countDocuments({
        video: { $in: userVideoIds }
    });

    // 3. Get Total Subscribers
    const totalSubscribers = await Follow.countDocuments({
        following: channelId
    });

    const stats = {
        totalSubscribers,
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: totalLikesCount || 0
    };

    return res.status(200).json(new ApiResponse(200, stats, "Stats synced"));
});

const getChannelVideos = asynchandler(async (req, res) => {
    const { channelId } = req.params;

    const videos = await Video.aggregate([
        { $match: { owner: channelId } },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "likes",
                let: { videoId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$video", "$$videoId"] },
                                    { $eq: ["$video", { $toString: "$$videoId" }] }
                                ]
                            }
                        }
                    }
                ],
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },
        { $project: { likes: 0 } } // Clean up response
    ]);

    return res.status(200).json(new ApiResponse(200, videos, "Videos synced"));
});

export {
    getChannelStats,
    getChannelVideos
};