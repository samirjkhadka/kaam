import express from "express";
import cors from "cors";

import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/dbConfig/dbConfig.js";


import cloudinary from "cloudinary";
import fileUpload from "express-fileupload";
import userRouter from "./routes/userRoutes.js";
import router from "./routes/index.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();
dotenv.config();
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

const port = process.env.PORT || 5000;



const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(cookieParser());
app.use(router)
//error middleware
connectDB();
app.use(errorMiddleware);

//API Endpoints

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get("/", (req, res) => {
  res.send("Kaam Khojau V2 API IS RUNNING !");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
