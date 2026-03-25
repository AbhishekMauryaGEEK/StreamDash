import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const Commentrouter = Router();

Commentrouter.use(verifyJWT); // All comment routes require login

Commentrouter.route("/:videoId").get(getVideoComments).post(addComment);
Commentrouter.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default Commentrouter;