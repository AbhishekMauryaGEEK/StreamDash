import mongoose from "mongoose";
const ProductSchema = new mongoose.Schema({
    description: {
        required: true,
        type: String,
    },
    name: {
        required: true,
        type: String
    },
    ProductImage: {
        type:String
    },
    price:{
        type:Number,
        default:0
    },
    catagory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required :true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
}, { timestamps: true })
export const Product = mongoose.model('Product', ProductSchema);