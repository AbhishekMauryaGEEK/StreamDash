import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asynchandler } from "../utils/asyncHandler.js"
// 1. Create Playlist
const createPlaylist = asynchandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) throw new ApiError(400, "Name and description are required");

    const playlist = await Playlist.create({
        name,
        description:description || "",
        owner: req.user?._id,
        videos: []
    });

    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created"));
});

// 2. Get User Playlists
const getUserPlaylists = asynchandler(async (req, res) => {
    const { userId } = req.params;

    const playlists = await Playlist.aggregate([
        { 
            $match: { owner: userId } 
        },
        {
            $lookup: {
                from: "videos",
                let: { video_ids: "$videos" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: [
                                    { $toString: "$_id" }, 
                                    { $map: { input: "$$video_ids", as: "v", in: { $toString: "$$v" } } }
                                ]
                            }
                        }
                    },
                    { $project: { thumbnail: 1 } },
                    { $limit: 1 } // Only need the first one for the cover
                ],
                as: "coverVideo"
            }
        },
        {
            $addFields: {
                thumbnail: { $arrayElemAt: ["$coverVideo.thumbnail", 0] }
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, playlists, "Playlists fetched"));
});
// 3. Add Video to Playlist
const addVideoToPlaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // $addToSet ensures no duplicate video is added
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $addToSet: { videos: videoId } },
        { new: true }
    );

    if (!playlist) throw new ApiError(404, "Playlist not found");
    return res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist"));
});

// 4. Remove Video from Playlist
const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true }
    );

    if (!playlist) throw new ApiError(404, "Playlist not found");
    return res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist"));
});

// 5. Update/Delete Playlist (Standard Logic)
const deletePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params;
    
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");
    
    // Check ownership
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this playlist");
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});
const updatePlaylist = asynchandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $set: { name, description } },
        { new: true }
    );
    return res.status(200).json(new ApiResponse(200, playlist, "Playlist updated"));
});
const getPlaylistById = asynchandler(async (req, res) => {
    const { playlistId } = req.params;

    const rawPlaylist = await Playlist.findById(playlistId);
    if (!rawPlaylist) throw new ApiError(404, "Playlist not found");

    const playlist = await Playlist.aggregate([
        {
            $match: { _id: rawPlaylist._id }
        },
        {
            $lookup: {
                from: "videos",
                let: { video_ids: "$videos" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                // This forces the match even if types are mixed
                                $in: [{ $toString: "$_id" }, { 
                                    $map: { 
                                        input: "$$video_ids", 
                                        as: "vid", 
                                        in: { $toString: "$$vid" } 
                                    } 
                                }]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "videoOwner",
                            pipeline: [{ $project: { username: 1, avatar: 1 } }]
                        }
                    },
                    { $unwind: "$videoOwner" }
                ],
                as: "playlistVideos"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [{ $project: { username: 1, avatar: 1 } }]
            }
        },
        { $unwind: "$ownerDetails" }
    ]);

    return res.status(200).json(new ApiResponse(200, playlist[0], "Fetched"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}