import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const Commentrouter = Router();

// 1. GET comments should be accessible to everyone 
// (verifyJWT is optional here, but we'll use it inside the controller logic safely)
Commentrouter.route("/:videoId").get(getVideoComments);

// 2. POST, PATCH, and DELETE definitely need verifyJWT
Commentrouter.route("/:videoId").post(verifyJWT, addComment);
Commentrouter.route("/c/:commentId")
    .patch(verifyJWT, updateComment)
    .delete(verifyJWT, deleteComment);

export default Commentrouter;