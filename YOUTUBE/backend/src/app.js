import express from "express"
import cors from "cors";
import cookieparser from "cookie-parser"
import multer from "multer"
import dotenv from "dotenv";
import path from "path";
dotenv.config({
    path: path.resolve(process.cwd(), ".env") 
});
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieparser())
app.use((req, res, next) => {
    console.log("---------------------");
    console.log("INCOMING REQUEST:");
    console.log("METHOD:", req.method);
    console.log("URL:", req.url); 
    console.log("FULL URL:", req.originalUrl);
    console.log("---------------------");
    next();
})
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscriber.route.js"
import videoRouter from "./routes/video.routes.js";
import likeRouter from "./routes/like.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import TweetRouter from "./routes/tweet.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import Commentrouter from "./routes/comment.routes.js";
// Routes Declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/tweets", TweetRouter);
app.use("/api/v1/Comment",Commentrouter);
app.use("/api/v1/playlist", playlistRouter);
app.use((error,req, res, next) => {
    if (error instanceof multer.MulterError) {
        console.log(' MULTER ERROR FIELD:', error.field);  // This shows the BAD field name
        return res.status(400).json({ error: `Unexpected field: ${error.field}` });
    }
    next(error);
});
//ex Route: http://localhost:8000/api/v1/users +/register =>
// http://localhost:8000/api/v1/users/register
//other examples like  http://localhost:8000/api/v1/users +/login or /help or /credits etc 
export default app;