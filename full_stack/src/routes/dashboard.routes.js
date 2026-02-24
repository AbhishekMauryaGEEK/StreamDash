import { Router } from 'express';
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Secure all dashboard routes

router.route("/stats/:channelId").get(getChannelStats);
router.route("/videos/:channelId").get(getChannelVideos);

export default router;