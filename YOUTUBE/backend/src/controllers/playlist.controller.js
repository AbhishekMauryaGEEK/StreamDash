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
    const playlists = await Playlist.find({ owner: userId });
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
    await Playlist.findByIdAndDelete(playlistId);
    return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted"));
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

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: playlistId // Using your UUID string
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "playlistVideos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "videoOwner",
                            pipeline: [
                                { $project: { username: 1, avatar: 1 } }
                            ]
                        }
                    },
                    { $unwind: "$videoOwner" }
                ]
            }
        }
    ]);

    if (!playlist.length) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
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