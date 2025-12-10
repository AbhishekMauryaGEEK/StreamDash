import mongoose from "mongoose";
const Catagory =new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
},{timestamps:true})
export const  catagory=mongoose.model('Category',Catagory)