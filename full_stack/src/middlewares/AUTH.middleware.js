import { User } from "../models/user.model.js";
import { ApiError } from "../utiles/Apperror.js";
import { asynchandler } from "../utiles/asynchandler.js";
import jwt from "jsonwebtoken";
export const verifyJWT = asynchandler(async (req, res, next) => {
    try{
        const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
        if (!token) {
            throw new ApiError(401,"Unauthorized request")
        }
        const decodetoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodetoken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401,"invalid Acess Token");
        }
        req.user=user;
        next()
    }
    catch(error){
        
        throw new ApiError(401,error?.message||"Invalid access token ");
    }

    })