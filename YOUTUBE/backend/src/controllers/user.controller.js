import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken";
import { upload as uploadToCloudinary } from "../utils/clouedinary.js";
import { sendEmail } from "../utils/sendEmail.js";
const generateAccessandrefereshtokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accesstoken = await user.generateAccessToken();
        const refreshtoken = await user.generateRefreshToken(); // 👈 Fixed spelling

        user.refreshToken = refreshtoken;
        await user.save({ validateBeforeSave: false });

        // Fix the return key here:
        return { accesstoken, refreshtoken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};
const registerUser = asynchandler(async (req, res) => {
    try {
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
        const avatarLocal = req.files && req.files.avatar ? req.files.avatar[0].path : null;
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
            avatar: avatar.url,
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
            new ApiResponse(201, createdUser, "User registered successfully!")
        );
    } catch (error) { // 👈 YOU MUST ADD '(error)' HERE
        console.error("CRITICAL REGISTRATION ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
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

    const passres = await userres.isPasswordCorrect(password)

    // Logic was backwards  
    if (!passres) {
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
        .cookie("refreshToken", refreshtoken, options)
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
const refreshaccessToken = asynchandler(async (req, res) => {
    // 1. Grab potential tokens
    const cookieToken = req.cookies?.refreshToken;
    const bodyToken = req.body?.refreshToken;

    // 2. DEBUG LOGS (This will show us the truth)
    console.log(" === REFRESH DEBUGGER ===");
    console.log("Cookie Token:", cookieToken ? "Present" : "Missing");
    console.log("Body Token:", bodyToken);
    console.log("Secret Loaded?", process.env.REFRESH_TOKEN_SECRET ? "YES" : "NO");

    const incomingrefreshtoken = req.body?.refreshToken || req.cookies?.refreshToken;

    if (!incomingrefreshtoken) {
        throw new ApiError(401, "Unauthorized request: No token found");
    }

    try {
        // 3. Verify
        const decodedtoken = jwt.verify(
            incomingrefreshtoken,
            process.env.REFRESH_TOKEN_SECRET
        );

        console.log("✅ Token Verified! User ID:", decodedtoken?._id);

        const user = await User.findById(decodedtoken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingrefreshtoken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }


        const { accesstoken, refreshtoken } = await generateAccessandrefereshtokens(user._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            secure: true
        }
        return res
            .status(200)
            .cookie("accessToken", accesstoken, options)
            .cookie("refreshToken", refreshtoken, options)
            .json(
                new ApiResponse(
                    200,
                    { accesstoken: accesstoken, refreshToken: refreshtoken },
                    "Access token Refreshed"
                )
            );

    } catch (error) {
        console.log(" CRITICAL ERROR:", error.message); // See the real error
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});
const changecurrentpassword = asynchandler(async (req, res) => {
    const { oldpassword, newpassword, confpassword } = await req.body;
    if (!(newpassword === confpassword)) {
        throw new ApiError(401, "password is invalid  ")
    }
    const user = await User.findById(req.user?.id)
    const ispasswordcorrect = await user.isPasswordCorrect(oldpassword)
    if (!ispasswordcorrect) {
        throw new ApiError(400, "invalid password")
    }
    user.password = newpassword;
    await user.save({ validateBeforeSave: false })
    return res.status(200)
        .json(new ApiResponse(200, {}, "password change succesfully"))
})
const getcurrentuser = asynchandler(async (req, res) => {
    // req.user is already injected by your verifyJWT middleware
    if (!req.user) {
        return res.status(401).json(
            new ApiResponse(401, null, "Unauthorized request")
        );
    }

    return res
        .status(200)
        .json(
            // This creates the exact { statusCode: 200, data: {...}, message: "..." } 
            // object that your frontend AuthContext is waiting for!
            new ApiResponse(
                200,
                req.user,
                "Current user fetched successfully"
            )
        );
});
const updateaccount = asynchandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new ApiError(400, "All feild are  required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullname,
                email: email
            }
        },
        { new: true }).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details update succesfuly"))
})
const updateavatar = asynchandler(async (req, res) => {
    const avatarpathlocal = await req.file?.path
    if (!avatarpathlocal) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const avatarpathcloud = await uploadToCloudinary(avatarpathlocal);
    if (!avatarpathcloud) {
        throw new ApiError(400, "Error while uploading on avatar");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatarpathcloud.url
            }
        },
        { new: true }
    ).select("-password")
    return res.
        status(200).
        json(new ApiResponse(200, user, ""))
})
const updatecoverimage = asynchandler(async (req, res) => {
    const coverpathlocal = await req.file?.path
    if (!coverpathlocal) {
        throw new ApiError(400, "Cover image was not found")
    }
    const coverimagecloud = await uploadToCloudinary(coverpathlocal);
    if (!coverimagecloud) {
        throw new ApiError(400, "Error while uploading  the coverimage")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverimagecloud.url
            }
        }, { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, user, ""))
})
const getUserProfile = asynchandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }
    console.log("Current Logged In User ID:", req.user?._id);
    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            // Look up followers (people following this user)
            $lookup: {
                from: "follows", // Changed from "subscriptions"
                localField: "_id",
                foreignField: "following", // Changed from "channel"
                as: "followers"
            }
        },
        {
            // Look up following (people this user follows)
            $lookup: {
                from: "follows", // Changed from "subscriptions"
                localField: "_id",
                foreignField: "follower", // Changed from "subscriber"
                as: "following"
            }
        },
        {
            $addFields: {
                followersCount: {
                    $size: "$followers"
                },
                followingCount: {
                    $size: "$following"
                },
                isFollowed: { // Changed from isSuscribed
                    $cond: {
                        if: {
                            $in: [req.user?._id.toString(), "$followers.follower"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                followersCount: 1, // Updated naming
                followingCount: 1, // Updated naming
                isFollowed: 1,     // Updated naming
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist in the database");
    }

    return res.status(200).json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});
const forgetpassword = asynchandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(404, "Email not found")
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(404, "User not found with  the email")
    }
    const otp = Math.floor(100000 * Math.random() * 90000);
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    try {
        await sendEmail({
            email: user.email,
            subject: "Your password RESET OTP",
            message: `your OTP is ${otp}. IT expires in 10 minutes.`
        })
        console.log(`Currently acting  email ,OTP fro ${email}:${otp}`);
    }
    catch (error) {
        //if email failes ,clear  the otp  feild  so user  can  try  again cleanly
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(500, "FAILED to  send  email, system error  please try again.")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Otp sent  to your  email successfully"))
})
const resetpassword = asynchandler(async (req, res) => {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "All feild are required");
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Password  do not match ")
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(400, "User not found");
    }
    if (user.resetPasswordOTP != otp) {
        throw new ApiError(400, "Invalid OTP");
    }
    if (user.resetPasswordExpires < Date.now()) {
        throw new ApiError(400, "OTP has expired.Plese request a new one")
    }
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password reset successfuly.You can now go to login."))
});
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshaccessToken,
    changecurrentpassword,
    getcurrentuser,
    updateaccount,
    updateavatar,
    updatecoverimage,
    getUserProfile,
    forgetpassword,
    resetpassword
}