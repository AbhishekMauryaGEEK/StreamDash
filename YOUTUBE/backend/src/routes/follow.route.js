import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    getFollowingList, 
    getFollowersList, 
    toggleFollow 
} from "../controllers/follow.controller.js";

const router = Router();
router.use(verifyJWT);

// Get the list of people I follow
router.route("/list/following").get(getFollowingList);

// Follow/Unfollow someone or get their followers
router.route("/u/:userId")
    .post(toggleFollow)
    .get(getFollowersList);

export default router;