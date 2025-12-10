import mongoose from "mongoose"
const Docter= new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    expirence: {
        type: String,
        required: true
    },
    worksinhospital: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Hospital'
    }],
},{timestamps:true});
export const docter=mongoose.model('Docter',Docter)
