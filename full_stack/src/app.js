import express from "express"
import cors from "cors";
import cookieparser from "cookie-parser"
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
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
import router from "./routes/user.routes.js";
app.use("/api/v1/users",router)
//ex Route: http://localhost:8000/api/v1/users +/register =>
// http://localhost:8000/api/v1/users/register
//other examples like  http://localhost:8000/api/v1/users +/login or /help or /credits etc 
export default app;