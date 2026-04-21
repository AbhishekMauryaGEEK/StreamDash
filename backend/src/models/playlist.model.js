import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videos: [
        {
            type: String, // Array of Video UUID Strings
            ref: "Video"
        }
    ],
    owner: {
        type: String, // UUID String of the creator
        ref: "User"
    }
}, { timestamps: true });

export const Playlist = mongoose.model("Playlist", playlistSchema);