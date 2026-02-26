import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const Tweetrouter = Router();
Tweetrouter.use(verifyJWT); // Apply to all routes

Tweetrouter.route("/").post(createTweet);
Tweetrouter.route("/user/:userId").get(getUserTweets);
Tweetrouter.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default Tweetrouter;