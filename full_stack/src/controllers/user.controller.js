import { asynchandler } from "../utiles/asynchandler.js";

const registerUser =asynchandler(async(req,res)=>{
     res.status(200).json({
        message:"okjijg"
    })
})
export {registerUser}