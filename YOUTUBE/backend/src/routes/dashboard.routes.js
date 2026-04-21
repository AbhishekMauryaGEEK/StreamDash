import { Router } from 'express';
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const Dashboardrouter = Router();

Dashboardrouter.use(verifyJWT); 

// Note: Using :channelId allows you to view other people's public stats 
// or your own dashboard data depending on the UUID passed
Dashboardrouter.route("/stats/:channelId").get(getChannelStats);
Dashboardrouter.route("/videos/:channelId").get(getChannelVideos);

export default Dashboardrouter;