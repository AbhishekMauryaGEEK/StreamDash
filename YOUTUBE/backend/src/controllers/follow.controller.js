import mongoose, { isValidObjectId } from "mongoose";
import { Follow } from "../models/follow.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asyncHandler.js";

const toggleFollow = asynchandler(async (req, res) => {
    const { userId } = req.params; 

    // CHANGE: Remove isValidObjectId. Just check if userId exists.
    if (!userId) throw new ApiError(400, "User ID is required");

    const credentials = { follower: req.user?._id, following: userId };
    const existingFollow = await Follow.findOne(credentials);

    if (existingFollow) {
        await Follow.findByIdAndDelete(existingFollow._id);
        return res.status(200).json(new ApiResponse(200, { followed: false }, "Unfollowed successfully"));
    }

    await Follow.create(credentials);
    return res.status(200).json(new ApiResponse(200, { followed: true }, "Followed successfully"));
});

const getFollowingList = asynchandler(async (req, res) => {
    // We just need the ID as a string
    const followerId = req.user?._id;

    if (!followerId) {
        throw new ApiError(401, "Invalid User Session");
    }

    const following = await Follow.aggregate([
        { 
            // DO NOT use 'new mongoose.Types.ObjectId()'
            // Matching directly against the UUID string
            $match: { follower: followerId } 
        },
        {
            $lookup: {
                from: "users",
                localField: "following",
                foreignField: "_id",
                as: "details",
                pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }]
            }
        },
        { $unwind: "$details" },
        { $project: { _id: 0, details: 1 } }
    ]);

    return res.status(200).json(new ApiResponse(200, following, "Following list fetched"));
});
const getFollowersList = asynchandler(async (req, res) => {
    const { userId } = req.params;
    
    // CHANGE: Remove isValidObjectId here too
    if (!userId) throw new ApiError(400, "User ID is required");

    const followers = await Follow.aggregate([
        { 
            // Match the UUID string directly
            $match: { following: userId } 
        },
        {
            $lookup: {
                from: "users",
                localField: "follower",
                foreignField: "_id",
                as: "details",
                pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }]
            }
        },
        { $unwind: "$details" },
        { $project: { _id: 0, details: 1 } }
    ]);

    return res.status(200).json(new ApiResponse(200, followers, "Followers list fetched"));
});

export { toggleFollow, getFollowingList, getFollowersList };