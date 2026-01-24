import { asynchandler } from "../utiles/asynchandler.js";
import { ApiError } from "../utiles/Apperror.js";
import { User } from "../models/user.model.js"
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utiles/Apiresponse.js";
import { upload as uploadToCloudinary } from "../utiles/clouedinary.js";
const generateAccessandrefereshtokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accesstoken = await user.generateAccessToken();
        const refereshtoken = await user.generateRefreshToken();
        user.refreshToken = refereshtoken;
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

    //   Use cloudinary for BOTH files 
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
    //req body ->data
    //username or email
    //find the user 
    //password check
    //access and referesh token 
    //send cookie 
    const { email , username, password } = req.body
    if (!username || !email) {
        throw new ApiError(400, "email or username is not correct ")
    }
    const userres = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!userres) {
        throw new ApiError(404, "user does not exist");
    }
    const passres = await username.isPasswordCorrect(password)
    if (passres) {
        throw new ApiError(401, "password is incorrect");
    }
    const { accessToken, refreshToken } = await generateAccessandrefereshtokens(userres._id)
    const loggedinuser = await User.findById(userres._id).select("-password -refreshToken")
    const options = {
        httpOly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)            
        .cookie("refreshtoken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedinuser, accessToken, refreshToken
                },
                "user logged in succesfuly"
            )
        )

})
const logoutUser = asynchandler(async (res, req) => {
    await User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        }
    )
    const options = {
        httpOly: true,
        secure: true
    }
    return res
    .status(200)
    .coverCookie("accessToken",options)
    .coverCookie("refreshToken",options)
    .json(new ApiResponse(200,{
    },"user logged out"))
})

export { registerUser, loginUser, logoutUser }