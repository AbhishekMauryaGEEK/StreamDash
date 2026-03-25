import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: String, 
        ref: "User"
    },
    channel: {
        type: String, 
        ref: "User"
    }
}, { timestamps: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);