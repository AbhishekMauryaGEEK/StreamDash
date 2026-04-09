import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/Subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asynchandler} from "../utils/asyncHandler.js"

const getChannelStats = asynchandler(async (req, res) => {
    const { channelId } = req.params; // This is the user's UUID string

    // 1. Get Video Stats (Total Videos & Total Views)
    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: channelId // Use the field that links video to user
            }
        },
        {
            
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" }
            }
        }
    ]);

    // 2. Get Total Subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    });

    // 3. Get Total Likes across all videos owned by this channel
    // This is a "Top 1%" query: It finds all video IDs by this user and counts likes for them
    const totalLikes = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoInfo"
            }
        },
        { $unwind: "$videoInfo" },
        {
            $match: {
                "videoInfo.owner": channelId
            }
        },
        {
            $count: "total"
        }
    ]);

    const stats = {
        totalSubscribers,
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.total || 0
    };

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

const getChannelVideos = asynchandler(async (req, res) => {
    const { channelId } = req.params;

    const videos = await Video.find({ owner: channelId }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});
export {
    getChannelStats, 
    getChannelVideos
    }