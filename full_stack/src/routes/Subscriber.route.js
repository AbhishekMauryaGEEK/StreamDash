import { Router } from "express";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/Subscription.controller.js";
import { verifyJWT } from "../middlewares/AUTH.middleware.js";
const router2 =Router()
router2.use(verifyJWT);
router2.route("/c/:channelId")
    .post(toggleSubscription)
    .get(getUserChannelSubscribers);
router2.route("/c/:channelId").get(getUserChannelSubscribers);
router2.route("/c/:channelId").get(getSubscribedChannels);
export default router2;