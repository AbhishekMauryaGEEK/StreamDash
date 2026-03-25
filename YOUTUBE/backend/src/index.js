// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import app from "./app.js";
import connectDb from "./dbs/index.js";
// require ('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import path from "path";
dotenv.config({
    path: path.resolve(process.cwd(), ".env")
})
connectDb()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running at port:${process.env.PORT}`)
    
    })
})
.catch((err)=>{
    console.log(`failed to log to the databse ${err}`)
})
// Aproch 1
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
