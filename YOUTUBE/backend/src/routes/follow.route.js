import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    getFollowingList, 
    getFollowersList, 
    toggleFollow 
} from "../controllers/follow.controller.js";

const followRouter = Router();
followRouter.use(verifyJWT);

// Get the list of people I follow
followRouter.route("/list/following").get(getFollowingList);

// Follow/Unfollow someone or get their followers
followRouter.route("/u/:userId")
    .post(toggleFollow)
    .get(getFollowersList);

export default followRouter;