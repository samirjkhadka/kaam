import express from "express";
import {
  createApplication,
  deleteApplication,
  employerGetAllApplication,
  seekerGetAllApplication,
} from "../controller/applicationController.js";
import { isAuthorized, userAuth } from "../middlewares/auth.js";

const applicationRouter = express.Router();

applicationRouter.post(
  "/createApplication/:id",
  userAuth,
  isAuthorized("Seeker"),
  createApplication
);
applicationRouter.get(
  "/employerGetAllApplication",
  userAuth,
  isAuthorized("Employer"),
  employerGetAllApplication
);
applicationRouter.get(
  "/seekerGetAllApplication",
  userAuth,
  isAuthorized("Seeker"),
  seekerGetAllApplication
);
applicationRouter.delete("/deleteApplication/:id", userAuth, deleteApplication);

export default applicationRouter;
