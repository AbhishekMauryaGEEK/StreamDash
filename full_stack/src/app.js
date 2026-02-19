import express from "express"
import cors from "cors";
import cookieparser from "cookie-parser"
import multer from "multer"
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieparser())

app.use((error,req, res, next) => {
    console.log("---------------------");
    console.log("INCOMING REQUEST:");
    console.log("METHOD:", req.method);
    console.log("URL:", req.url); 
    console.log("FULL URL:", req.originalUrl);
    console.log("---------------------");
    next();
})
import router from "./routes/user.routes.js";
import router2 from "./routes/Subscriber.route.js";

app.use("/api/v1/users",router)
app.use("/api/v1/subscriptions",router2)
// Add this AFTER all your routes
app.use((error, req, res, next) => {
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