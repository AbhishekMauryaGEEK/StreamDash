import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const verifyJWT = asynchandler(async (req, res, next) => {
    try {
        // console.log("=== AUTH DEBUG START ===");
        // console.log("Raw cookies:", req.cookies);
        // console.log("Raw headers.Authorization:", req.header("Authorization"));
        // 1. Try cookies first (most common)
        let token = req.cookies?.accessToken;
        console.log("Step 1 - Cookie token:", token);
        
        // 2. Fix malformed cookie (remove prefix if exists)
        if (token && token.includes('accessToken=')) {
            token = token.split('=')[1];
            console.log("Step 2 - Cleaned cookie:", token);
        }
        
        // 3. Fallback to Authorization header
        if (!token) {
            const authHeader = req.header("Authorization");
            token = authHeader?.replace("Bearer ", "");
            console.log("Step 3 - Header token:", token);
        }
        
        console.log("Final token to verify:", token ? `${token.slice(0, 20)}...` : "EMPTY");
        
        if (!token) {
            console.log(" NO TOKEN FOUND");
            throw new ApiError(401, "No access token provided");
        }
        
        // 4. Verify JWT
        console.log("Verifying JWT...");
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET) 
        console.log(" JWT decoded:", decoded);
        
        // 5. Find user
        const user = await User.findById(decoded?._id).select("-password -refreshToken");
        console.log("User found:", user ? "YES" : " NO");
        
        if (!user) {
            throw new ApiError(401, "User not found - invalid token");
        }
        
        req.user = user;
        console.log(" AUTH SUCCESS - user set on req");
        console.log("=== AUTH DEBUG END ===\n");
        next();
        
    } catch (error) {
        console.log(" JWT ERROR:", error.name, error.message);
        console.log("Full error:", error);
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
