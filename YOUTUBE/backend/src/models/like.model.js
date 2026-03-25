import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    video: {
        type: String,
        ref: "Video"
    },
    comment: {
        type: String,
        ref: "Comment"
    },
    tweet: {
        type: String,
        ref: "Tweet"
    },
    likedBy: {
        type: String, // UUID String
        ref: "User"
    }
}, { timestamps: true });

export const Like = mongoose.model("Like", likeSchema);