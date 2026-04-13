import mongoose, { Schema } from "mongoose";

const followSchema = new Schema({
    follower: {
        type: Schema.Types.ObjectId, // The person doing the following
        ref: "User"
    },
    following: {
        type: Schema.Types.ObjectId, // The person being followed
        ref: "User"
    }
}, { timestamps: true });

export const Follow = mongoose.model("Follow", followSchema);