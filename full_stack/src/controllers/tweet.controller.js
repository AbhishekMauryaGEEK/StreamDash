import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asynchandler } from "../utils/asyncHandler.js"

// 1. Create Tweet
const createTweet = asynchandler(async (req, res) => {
    const { content } = req.body;
    if (!content) throw new ApiError(400, "Content is required");

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    });

    return res.status(201).json(new ApiResponse(201, tweet, "Tweeted successfully"));
});

// 2. Get User Tweets
const getUserTweets = asynchandler(async (req, res) => {
    const { userId } = req.params;

    const tweets = await Tweet.aggregate([
        { $match: { owner: userId } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [{ $project: { username: 1, avatar: 1 } }]
            }
        },
        { $unwind: "$ownerDetails" }
    ]);

    return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched"));
});

// 3. Update Tweet
const updateTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content } },
        { new: true }
    );

    if (!tweet) throw new ApiError(404, "Tweet not found");
    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated"));
});

// 4. Delete Tweet
const deleteTweet = asynchandler(async (req, res) => {
    const { tweetId } = req.params;
    await Tweet.findByIdAndDelete(tweetId);
    return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted"));
});
export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}