import { Router } from 'express';
import { healthcheck } from "../controllers/healthcheck.controller.js";

const HealthcheckRouter = Router();

HealthcheckRouter.route("/").get(healthcheck);

export default HealthcheckRouter;