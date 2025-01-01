import express from "express";
import userRoutes from "./userRoutes.js";


const router = express.Router();

const path = "/api/v1";

router.use(`${path}/users`, userRoutes);


export default router;