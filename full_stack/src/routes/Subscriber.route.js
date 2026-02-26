import { Router } from "express";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/Subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const subscriptionRouter =Router()
subscriptionRouter.use(verifyJWT);
subscriptionRouter.route("/c/:channelId")
    .post(toggleSubscription)
    .get(getUserChannelSubscribers);
subscriptionRouter.route("/c/:channelId").get(getUserChannelSubscribers);
subscriptionRouter.route("/c/:channelId").get(getSubscribedChannels);
export default subscriptionRouter;