import { asynchandler } from "../utiles/asynchandler.js";
import { ApiError } from "../utiles/APIerror.js";
import { User } from "../models/user.model.js"
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utiles/Apiresponse.js";
import jwt from "jsonwebtoken";
import { upload as uploadToCloudinary } from "../utiles/clouedinary.js";
const generateAccessandrefereshtokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accesstoken = await user.generateAccessToken();
        const refereshtoken = await user.generateRefreshToken();
        user.refreshToken = refereshtoken;
        user.accessToken = accesstoken;
        await user.save({ validateBeforeSave: false })
        return { accesstoken, refereshtoken };
    }
    catch (error) {
        throw new ApiError(500, "something went wrong  while generating refresesh and access token")

    }
}
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

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocal) {
        throw new ApiError(400, "Avatar is required")
    }

    // cloudinary for BOTH files 
    const avatar = await uploadToCloudinary(avatarLocal);
    const coverimage = coverImageLocalPath ? await uploadToCloudinary(coverImageLocalPath) : "";

    if (!avatar) {
        throw new ApiError(404, "Avatar file is not found")
    }

    const userdata = await User.create({
        fullname,
        avatar: avatar,
        coverImage: coverimage || "",
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

const loginUser = asynchandler(async (req, res) => {
    console.log("req.body:", req.body);
    console.log("content-type:", req.headers['content-type']);
    const { email, username, password } = req.body

    if (!username && !email || !password) {
        throw new ApiError(400, "email/username and password required");
    }

    // Find user
    const userres = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!userres) {
        throw new ApiError(404, "user does not exist");
    }

    const passres = await userres.isPasswordCorrect(password)  // ← userres!

    // Logic was backwards  
    if (!passres) {  // ← NOT passres
        throw new ApiError(401, "password is incorrect");
    }

    const { accesstoken, refreshtoken } = await generateAccessandrefereshtokens(userres._id)

    const loggedinuser = await User.findById(userres._id).select("-password")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .cookie("accessToken", accesstoken, options)
        .cookie("refreshToken", refreshtoken, options)  // ← Typo was refreshtoken
        .json(
            new ApiResponse(200, {
                user: loggedinuser,
                accesstoken,
                refreshtoken
            }, "user logged in successfully")
        )
})

const logoutUser = asynchandler(async (req, res) => {
    let userId;

    let token = req.cookies?.accessToken;
    if (token && token.includes('accessToken=')) {
        token = token.split('=')[1];
    }
    if (!token) {
        token = req.header("Authorization")?.replace("Bearer ", "");
    }

    if (!token) {
        return res.status(401).json(new ApiResponse(401, {}, "No access token"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    userId = decoded._id;

    await User.findByIdAndUpdate(
        userId,
        {
            $set: { refreshToken: null }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        );
});
try {
    const refreshaccessToken = asynchandler(async (req, res) => {
        const incomingrefreshtoken = await req.cookies.refereshtoken || req.body.refereshtoken
        if (!incomingrefreshtoken) {
            throw new ApiError(401, "Unauthrorized request")
        }
        const decodedtoken = jwt.verify(incomingrefreshtoken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedtoken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        if (incomingrefreshtoken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accesstoken, newrefereshtoken } = await
            generateAccessandrefereshtokens(user._id)
        return res
            .status(200)
            .cookie("accessToken", accesstoken, options)
            .cookie("refreshToken", newrefereshtoken, options)
            .json(
                new ApiResponse(
                    200, {
                    accesstoken, refreshToken: newrefereshtoken
                }, "Access token Refreshed"
                )
            )
    })
} catch (error) {
    throw new ApiError(401,error?.message||"Invalid refresh token");
}
export { registerUser, loginUser, logoutUser, refreshaccessToken }