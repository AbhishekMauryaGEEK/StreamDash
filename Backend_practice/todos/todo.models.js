import mongoose, { Schema } from "mongoose";
import { reference } from "three/tsl";
const todoSchema = new mongoose.Schema({
    content: {
        type: string,
        required: true,
    },
    complete_on: {
        type: Boolean,
        default: false
    },
    createdby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subTodos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Sub"
        }
    ]
}, { timestamps: true })

export const Todo = mongoose.model("Todo", todoSchema)