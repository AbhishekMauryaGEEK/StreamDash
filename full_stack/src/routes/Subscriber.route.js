import { Router } from "express";
import { toggleSubscription } from "../controllers/user.Subscribtion.js";
import { verifyJWT } from "../middlewares/AUTH.middleware.js";
const router =Router()
router.route("/")