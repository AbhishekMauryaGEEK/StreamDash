import mongoose from "mongoose"
const Patient = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    diagonsedwith: {
        type: String,
        required: true
    },
    blood_group: {
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        enum:['M','F','O'],
        required:true
    },
    addmited_in:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Hospital'
    }
}, { timestamps: true });
export const patient = mongoose.model('Patient', Patient)
