import express from "express";
import userRoutes from "./userRoutes.js";
import jobRouter from "./jobRoutes.js";
import applicationRouter from "./applicationRoutes.js";

const router = express.Router();

const path = "/api/v1";

router.use(`${path}/users`, userRoutes);
router.use(`${path}/jobs`, jobRouter);
router.use(`${path}/applications`, applicationRouter);

export default router;
