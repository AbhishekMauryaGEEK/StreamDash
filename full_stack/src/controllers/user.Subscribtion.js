import { asyncHandler } from "../utils/asyncHandler.js"; 
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    // Security Check: Prevent self-subscription
    if (channelId.toString() === req.user?._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const subscription = await Subscription.findOne({
        subscriber: req.user?._id, 
        channel: channelId,
    });

    if (subscription) {
        // Unsubscribe
        await Subscription.findByIdAndDelete(subscription._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"));
    } else {
        // Subscribe
        await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId,
        });
        return res
            .status(200)
            .json(new ApiResponse(200, { subscribed: true }, "Subscribed successfully"));
    }
});
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId), 
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber", 
                foreignField: "_id",
                as: "subscriberDetails",
            },
        },
        {
            $unwind: "$subscriberDetails",
        },
        {
            $project: {
                _id: 0,
                subscriberId: "$subscriberDetails._id",
                username: "$subscriberDetails.username",
                fullName: "$subscriberDetails.fullName",
                avatar: "$subscriberDetails.avatar",
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { count: subscribers.length, subscribers }, 
                "Subscribers fetched successfully"
            )
        );
});
const getSubscribedChannels = asyncHandler(async (req, res) => { 
    const { subscriberId } = req.params; 

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber ID");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId), 
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails",
            },
        },
        {
            $unwind: "$channelDetails",
        },
        {
            $project: {
                _id: 0,
                channelId: "$channelDetails._id",
                username: "$channelDetails.username",
                fullName: "$channelDetails.fullName",
                avatar: "$channelDetails.avatar",
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { count: subscribedChannels.length, subscribedChannels },
                "Subscribed channels fetched successfully"
            )
        );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };