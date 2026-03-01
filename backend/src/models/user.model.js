import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pkg from 'uuid';
const { v4: uuidv4 } = pkg;
const userSchema = new Schema({
    _id: {
        type: String,
        default: uuidv4,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, 'password is required']
    },
    refreshToken: {
        type: String
    },
    resetPasswordOTP:{
        type:String,
        default:undefined
    },
    resetPasswordExpires:{
        type:String,
        default:undefined
    }
}, { timestamps: true });

// FIX: REMOVED 'next'. 
// We use simple async/await. If it throws, Mongoose catches it automatically.
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        //change id to UUID
        _id: this._id,
        email: this.email,
        username: this.username,
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY

    });
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        //change id to UUID
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        //currenttime  atribute 
    });
};

export const User = mongoose.model('User', userSchema);