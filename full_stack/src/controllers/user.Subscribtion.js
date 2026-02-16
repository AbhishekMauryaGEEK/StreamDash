import { asynchandler } from "../utiles/asynchandler";
import { ApiError } from "../utiles/APIerror";
import { Subscription } from "../models/Subscription.model";
import { ApiResponse } from "../utiles/Apiresponse";
import jwt from "jsonwebtoken";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model";
const toggleSubscription = asynchandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel id is Invalid");
    }
    if (channelId.toString() === req.User?._id.toString()) {
        throw new ApiError(400, "You cannnot subscribe to your own channel");
    }
    const subscriptionInst = await Subscription.findOne({
        subscriber: req.User?._id,
        channel: channelId,
    });
    if (subscriptionInst) {
        await Subscription.findByIdAndDelete(subscriptionInst._id);
        return res
            .status(200)
            .json(new ApiError(200, { subscribed: false }, "Unsubscribed successfuly"));

    }
    else {
        await Subscription.create({
            subscriber:req.User?._id,
            channel:channelId,
        });
        return res
        .status(200)
        .json(new ApiError(200,{subscribed:true},"Subscribed successfulyy"))
    }
})

export {
    toggleSubscription
}