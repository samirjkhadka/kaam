import express from "express";
import {
  createJob,
  deleteJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
} from "../controller/jobController.js";
import { isAuthorized, userAuth } from "../middlewares/auth.js";

const jobRouter = express.Router();

jobRouter.post("/createJob", userAuth, isAuthorized("Employer"), createJob);
jobRouter.put("/updateJob", userAuth, isAuthorized("Employer"), updateJob);
jobRouter.get("/getMyJobs", userAuth, isAuthorized("Employer"), getMyJobs);
jobRouter.get("/getAllJobs", userAuth, isAuthorized("Employer"), getAllJobs);
jobRouter.get(
  "/getJobsById/:id",
  userAuth,
  isAuthorized("Employer"),
  getJobById
);
jobRouter.delete(
  "/deleteJob/:id",
  userAuth,
  isAuthorized("Employer"),
  deleteJob
);
export default jobRouter;
