import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
const togglevideolike =asynchandler(async(req,res)=>{
    const{videoId}=req.params;
    const userId=req.user?._id;
    const existingLike =await Like.findOne({
        video:videoId,
        likedBy:userId
    });
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id);
        return res
        .status(200)
        .json(new ApiResponse(200,{isLiked:false},"Unliked video"));
    }
    await Like.create({
        video:videoId,
        likedBy:userId
    });
    return res
    .status(200)
    .json(new ApiResponse(200,{isLiked:true},"Liked video"));
});
const toggleCommentLike =asynchandler(async(req,res)=>{
    const{commentId}=req.params;
    const userId=req.user?._id;
    const existingLike =await Like.findOne({
        comment:commentId,
        likedBy:userId
    });
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id);
        return res
        .status(200)
        .json(new ApiResponse(200,{isLiked:false},"Unliked Comment"));
    }
    await Like.create({
        comment:commentId,
        likedBy:userId
    });
    return res
    .status(200)
    .json(new ApiResponse(200,{isLiked:true},"Liked video"));
});
const toggletweetlike =asynchandler(async(req,res)=>{
    const {tweetId}=req.params;
    const userId=req.user?._id;
    const existingLike=await Like.findOne({
        tweet:tweetId,
        likedBy:userId
    });
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id);
        return res
        .status(200)
        .json(new ApiResponse(200,{isLiked:false},"unliked tweet"));
    }
    await Like.create({
        tweet:tweetId,
        likedBy:userId
    });
    return res
    .status(200)
    .json(new ApiResponse(200,{isLiked:true},"liked tweet"));
});
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: userId,
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                            pipeline: [
                                { $project: { username: 1, fullName: 1, avatar: 1 } }
                            ]
                        }
                    },
                    { $unwind: "$ownerDetails" }
                ]
            }
        },
        { $unwind: "$videoDetails" },
        {
            $replaceRoot: { newRoot: "$videoDetails" }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});
export {
    togglevideolike,
    toggleCommentLike,
    toggletweetlike,
    getLikedVideos
}