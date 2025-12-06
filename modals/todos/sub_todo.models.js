import mongoose from "mongoose";
const subtodo = new mongoose.Schema({
    content: {
        type: string,
        required: true
    },
    complete: {
        type: Boolean,
        default: false
    },
    createdby:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
}, { timestamps: true })
export const Sub = mongoose.model("Sub", subtodo)