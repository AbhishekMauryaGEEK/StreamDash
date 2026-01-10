import { asynchandler } from "../utiles/asynchandler.js";
import { ApiError } from "../utiles/Apperror.js";
import { User } from "../models/user.model.js"
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utiles/Apiresponse.js";
import { v2 as cloudinary } from "cloudinary";
import { upload as uploadToCloudinary } from "../utiles/clouedinary.js";

const registerUser = asynchandler(async (req, res) => {
    //get user details from frontend
    //validation -not empty
    //check if user  already exist :email,username
    //check for image ,check for avatar
    //upload them to cloudinary,avatar
    //create user object -create entry in db
    // remove password and refresh token from response 
    //check for user creation 
    //return res 
    const { username, email, fullname, password } = req.body
    console.log(`username:${username}`)
    console.log(`password:${password}`)
    console.log(`email:${email}`)
    console.log(`fullname:${fullname}`)
    // if(fullname===""){
    //     throw new ApiError(400,"Fullname is required")
    // }
    if ([fullname, email, username, password].some((data) =>
        data?.trim() === "")) {
        throw new ApiError(400, "All values are  required ")
    }
    const existeduser = await User.findOne({
        $or: [{ username }, { email }]
    })
    console.log(existeduser);
    if (existeduser) {
        throw new ApiError(409, "User with creditales allready exist")
    }
    const avatarLocal = req.files?.avatar[0]?.path;
    console.log(avatarLocal);
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!avatarLocal) {
        throw new ApiError(400, "Avatar is required")
    }

    //  FIXED: Use cloudinary for BOTH files (was using upload() middleware incorrectly)
    const avatar = await cloudinary.uploader.upload(avatarLocal);
    const coverimage = await cloudinary.uploader.upload(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(404, "Avatar file is not found")
    }

    const userdata = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverimage?.url || "",  // ✅ FIXED: coverImage (not coverimage)
        email,
        password,
        username: username.toLowerCase()
    })
    await userdata.save();
    console.log(userdata);
    const createdUser = await User.findById(userdata._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong when regestring the User")
    }
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered succesfully!")
    )
})

export { registerUser }
