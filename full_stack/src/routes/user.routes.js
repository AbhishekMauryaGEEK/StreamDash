import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { loginUser, registerUser, logoutUser, refreshaccessToken, updateaccount,changecurrentpassword,updateavatar,updatecoverimage,getUserProfile, getcurrentuser,forgetpassword, resetpassword } from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/AUTH.middleware.js"
const router = Router()
router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser)
router.route("/login").post(loginUser)
// Secured Routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshaccessToken)
router.route('/change-password').patch(verifyJWT, changecurrentpassword);
router.route('/current-user').get(verifyJWT, getcurrentuser); // Fixed typo 'currentusser'
router.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateavatar);
router.route('/update-cover-image').patch(verifyJWT, upload.single('coverImage'), updatecoverimage);
// PROFILES
// The :username is CRITICAL. It tells Express "put whatever is here into req.params.username"
router.route("/c/:username").get(verifyJWT, getUserProfile); 
router.route('/update-user').patch(verifyJWT, updateaccount);
router.route("/forget-password").post(forgetpassword);
router.route("/reset-password").post(resetpassword);
export default router