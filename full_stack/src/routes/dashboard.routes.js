import { Router } from 'express';
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const Dashboardrouter = Router();

Dashboardrouter.use(verifyJWT); // Secure all dashboard routes

Dashboardrouter.route("/stats/:channelId").get(getChannelStats);
Dashboardrouter.route("/videos/:channelId").get(getChannelVideos);

export default Dashboardrouter;