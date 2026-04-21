import mongoose, { Schema } from "mongoose";

const followSchema = new Schema({
    follower: {
        type: String, // Changed from Schema.Types.ObjectId
        ref: "User"
    },
    following: {
        type: String, // Changed from Schema.Types.ObjectId
        ref: "User"
    }
}, { timestamps: true });

export const Follow = mongoose.model("Follow", followSchema);