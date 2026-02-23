import { videoRouter } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from "../middlewares/multer.middleware.js";

const videoRouter = videoRouter();

// Apply verifyJWT middleware to all routes in this file
videoRouter.use(verifyJWT); 

videoRouter
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

videoRouter
    .route("/v/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

videoRouter.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default videoRouter;