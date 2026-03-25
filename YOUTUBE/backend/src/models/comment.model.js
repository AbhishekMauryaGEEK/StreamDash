import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    video: {
        type: String, // UUID String of the video
        ref: "Video"
    },
    owner: {
        type: String, // UUID String of the user
        ref: "User"
    }
}, { timestamps: true });

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);