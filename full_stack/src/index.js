// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDb from "./dbs/index.js";
// require ('dotenv').config({path:'./env'})
import dotenv from "dotenv"
dotenv.config({
    path:'./env'
})
connectDb();
//Aproch 1
// import express from "express"
// const app=express();
// (async()=>{
//     try{
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error",(error)=>{
//         console.log("error",error);
//         throw error
//        })
//        app.listen(process.env.MONGODB_URI,()=>{
//         console.log(`App is listening on port ${process.env.PORT} `);
//        })
//     }
//     catch(error){
//         console.log("Error:",error)
//         throw err
//     }
// }) ()
