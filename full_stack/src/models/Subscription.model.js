import mongoose, { Schema } from "mongoose";
const subscriptionSchema = new Schema({
    subcriber: {
        type: Schema.Types.ObjectId, 
        //one who is Subscribing
        ref: "User"
    },
    chanel:{
        type: Schema.Types.ObjectId, 
        //the one who is being subscribed 
        ref: "User"
    }
}, {
    timestamps: true 
})

export const Subcription = mongoose.model("Subscription", subscriptionSchema)