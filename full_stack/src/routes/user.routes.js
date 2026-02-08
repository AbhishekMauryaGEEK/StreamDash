import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { loginUser, registerUser, logoutUser, refreshaccessToken, updateaccount,changecurrentpassword,getUserProfile,updateavatar,updatecoverimage,getUserProfile, getcurrentuser } from "../controllers/user.controller.js"
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
//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshaccessToken)
router.route('/change-password').patch(verifyJWT,changecurrentpassword);
router.route('/currentusser').get(verifyJWT,getcurrentuser);
router.route('/update-avatar').patch(verifyJWT,upload,updateavatar);
router.route('/update-cover-image').patch(verifyJWT,upload,updatecoverimage);
router.route('getuser').get(verifyJWT,getUserProfile);
router.route('/update-user').path(verifyJWT, updateaccount)
console.log("User Routes File Loaded!");
export default router