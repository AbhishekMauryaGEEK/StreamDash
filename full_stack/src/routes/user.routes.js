import {Router} from "express"
import { registerUser } from "../controllers/user.controller.js"
const router=Router()
router.route("/register").post(registerUser)
console.log("User Routes File Loaded!"); 
export default router