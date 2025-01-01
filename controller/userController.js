import { sendToken } from "../middlewares/token.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import ErrorHandler from "../middlewares/errorMiddleware.js";

export const register = async (req, res, next) => {
  try {
    // destructure
    const {
      firstName,
      middleName,
      lastName,
      email,
      phone,
      address,
      password,
      role,
      firstNiche,
      secondNiche,
      thirdNiche,
      coverLetter,
    } = req.body;

    // validate
    if (!firstName) {
      return next(new ErrorHandler("Please enter your first name.", 400, 1)); // 400 is status code for bad request
    }

    if (!lastName) {
      return next(new ErrorHandler("Please enter your last name.", 400, 1));
    }
    if (!email) {
      return next(new ErrorHandler("Please enter your email.", 400, 1));
    }

    if (!phone) {
      return next(new ErrorHandler("Please enter your phone number.", 400, 1));
    }

    if (!address) {
      return next(new ErrorHandler("Please enter your address.", 400, 1));
    }

    if (!password) {
      return next(new ErrorHandler("Please enter your password.", 400, 1));
    }

    if (!role) {
      return next(new ErrorHandler("Please enter your role.", 400, 1));
    }

    // validate niches
    if (role === "Job Seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
      return next(
        new ErrorHandler("Please provide your preferred job niches.", 400, 1)
      );
    }
    // check if user already exists
    const existingUser = await userModel.findOne({ email });
    // if user already exists
    if (existingUser) {
      return next(new ErrorHandler("Email is already registered.", 400, 1));
    }
    // create user
    const userData = {
      firstName,
      middleName,
      lastName,
      email,
      phone,
      address,
      password,
      role,
      niches: {
        firstNiche,
        secondNiche,
        thirdNiche,
      },
      coverLetter,
    };
    // upload resumes
    if (req.files && req.files.resume) {
      const { resume } = req.files;
      if (resume) {
        try {
          const cloudinaryResponse = await cloudinary.uploader.upload(
            resume.tempFilePath,
            { folder: "Job_Seekers_Resume" }
          );
          if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(
              new ErrorHandler("Failed to upload resume to cloud.", 500)
            );
          }
          userData.resume = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
          };
        } catch (error) {
          return next(new ErrorHandler("Failed to upload resume", 500));
        }
      }
    }

    // upload profileImage
    if (req.files && req.files.profileImage) {
      const { profileImage } = req.files;
      if (profileImage) {
        try {
          const cloudinaryResponse = await cloudinary.uploader.upload(
            profileImage.tempFilePath,
            { folder: "Job_Seekers_profileImage" }
          );
          if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(
              new ErrorHandler("Failed to upload profileImage to cloud.", 500)
            );
          }
          userData.profileImage = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
          };
        } catch (error) {
          return next(new ErrorHandler("Failed to upload profileImage", 500));
        }
      }
    }
    // create user
    const user = await userModel.create(userData);
    // send token
    sendToken(user, 201, res, "User Registered.");
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { role, email, password } = req.body;

  if (!role) {
    return next(new ErrorHandler("Please enter your role.", 400, 1));
  }

  if (!email) {
    return next(new ErrorHandler("Please enter your email.", 400, 1));
  }

  if (!password) {
    return next(new ErrorHandler("Please enter your password.", 400, 1));
  }

  try {
    const existingUser = await userModel.findOne({ email }).select("+password");

    if (!existingUser) {
      return next(new ErrorHandler("Invalid email or password.", 400, 1));
    }

    const isPasswordMatched = await existingUser.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password.", 400, 1));
    }

    if (existingUser.role !== role) {
      return next(new ErrorHandler("Invalid role.", 400, 1));
    }
    sendToken(existingUser, 200, res, "User Logged In.");
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully.",
    });
};
export const getUser = async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
};
