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
    if (role === "Seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
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

export const updateProfile = async (req, res, next) => {
  try {
    const updateUserData = {
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      password: req.body.password,
      role: req.body.role,
      niches: {
        firstNiche: req.body.firstNiche,
        secondNiche: req.body.secondNiche,
        thirdNiche: req.body.thirdNiche,
      },
      coverLetter: req.body.coverLetter,
    };

    const { firstNiche, secondNiche, thirdNiche } = updateUserData.niches;

    if (
      req.user.role === "seeker" &&
      (!firstNiche || !secondNiche || !thirdNiche)
    ) {
      return next(
        new ErrorHandler(
          "Please enter your first niche, second niche and third niche.",
          400
        )
      );
    }
    if (req.files) {
      const resume = req.files.resume;
      if (resume) {
        try {
          const currentResumeId = req.user.resume.public_id;

          if (currentResumeId) {
            await cloudinary.uploader.destroy(currentResumeId);
          }
          const cloudinaryResponse = await cloudinary.uploader.upload(
            resume.tempFilePath,
            { folder: "Job_Seekers_Resume" }
          );
          if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(
              new ErrorHandler("Failed to upload resume to cloud.", 500)
            );
          }
          updateUserData.resume = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
          };
        } catch (error) {
          return next(new ErrorHandler("Failed to upload resume", 500));
        }
      }
    }

    if (req.files) {
      const resume = req.files.profileImage;
      if (profileImage) {
        try {
          const currentProfileImageId = req.user.profileImage.public_id;

          if (currentProfileImageId) {
            await cloudinary.uploader.destroy(currentProfileImageId);
          }
          const cloudinaryResponse = await cloudinary.uploader.upload(
            profileImage.tempFilePath,
            { folder: "Job_Seekers_profileImage" }
          );
          if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(
              new ErrorHandler("Failed to upload profileImage to cloud.", 500)
            );
          }
          updateUserData.profileImage = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
          };
        } catch (error) {
          return next(new ErrorHandler("Failed to upload profileImage", 500));
        }
      }
    }

    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      updateUserData,
      {
        new: true, // return the updated document
        runValidators: true,
        useFindAndModify: false, // validate the updated document against the schema
      }
    );
    res.status(200).json({
      success: true,
      user,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return next(
        new ErrorHandler(
          "Please enter old password, new password and confirm new password.",
          400,
          1
        )
      );
    }

    const user = await userModel.findById(req.user._id).select("+password");

    const isPasswordMatched = await user.comparePassword(oldPassword);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid old password.", 400, 1));
    }

    if (newPassword !== confirmNewPassword) {
      return next(new ErrorHandler("Password does not match.", 400, 1));
    }

    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res, "Password Updated.");
  } catch (error) {
    next(error);
  }
};
