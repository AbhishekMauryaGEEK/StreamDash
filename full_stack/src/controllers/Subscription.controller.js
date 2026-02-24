import { ApiResponse } from "../utiles/ApiResponse.js";
import { ApiError } from "../utiles/APIerror.js";
import { asynchandler } from "../utiles/asynchandler.js";
import { Subscription } from "../models/Subscription.model.js";
import mongoose, { isValidObjectId } from "mongoose";
const toggleSubscription = asynchandler(async (req, res) => {
    const { channelId } = req.params;

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
const getUserChannelSubscribers = asynchandler(async (req, res) => {
    const { channelId } = req.params;


    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channelId,
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
const getSubscribedChannels = asynchandler(async (req, res) => {
    const { subscriberId } = req.params;



    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: subscriberId,
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