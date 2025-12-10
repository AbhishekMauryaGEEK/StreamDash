import mongoose from "mongoose"
const Hospital = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address_1: {
        type: String,
        required: true
    },
    address_2: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    Speceilization:{
        type:String,
        required:true
    }
}, { timestamps: true });
export const hospital = mongoose.model('Hospital', Hospital)
