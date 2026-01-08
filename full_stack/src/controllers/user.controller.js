import { asynchandler } from "../utiles/asynchandler.js";

const registerUser = asynchandler(async (req, res) => {
    
    //get user details from frontend
    //validation -not empty
    //check if user  already exist :email,username
    //check for image ,check for avatar
    //upload them to cloudinary,avatar
    //create user object -create entry in db
    // remove password and refresh token from response 
    //check for user creation 
    //return res 
    const { username, email, fullname, password } = req.body
console.log(`username:${username}`)
console.log(`password:${password}`)
console.log(`email:${email}`)
console.log(`fullname:${fullname}`)
})

export { registerUser }