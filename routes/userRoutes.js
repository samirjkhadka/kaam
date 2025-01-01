import express from "express";
import {
  getUser,
  login,
  logout,
  register,
} from "../controller/userController.js";
import { userAuth } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/registerUser", register);
userRouter.post("/loginUser", login);
userRouter.get("/logout", userAuth, logout);
userRouter.get("/getUser", userAuth, getUser);

export default userRouter;
