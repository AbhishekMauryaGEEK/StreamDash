import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { loginUser, registerUser, logoutUser, refreshaccessToken, updateaccount,changecurrentpassword,updateavatar,updatecoverimage,getUserProfile, getcurrentuser,forgetpassword, resetpassword } from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const userRouter = Router()
userRouter.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser)
userRouter.route("/login").post(loginUser)
// Secured Routes
userRouter.route("/logout").post(verifyJWT, logoutUser)
userRouter.route('/refresh-token').post(refreshaccessToken)
userRouter.route('/change-password').patch(verifyJWT, changecurrentpassword);
userRouter.route('/current-user').get(verifyJWT, getcurrentuser); // Fixed typo 'currentusser'
userRouter.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateavatar);
userRouter.route('/update-cover-image').patch(verifyJWT, upload.single('coverImage'), updatecoverimage);
// PROFILES
// The :username is CRITICAL. It tells Express "put whatever is here into req.params.username"
userRouter.route("/c/:username").get(verifyJWT, getUserProfile); 
userRouter.route('/update-account').patch(verifyJWT, updateaccount);
userRouter.route("/forget-password").post(forgetpassword);
userRouter.route("/reset-password").post(resetpassword);
export default userRouter