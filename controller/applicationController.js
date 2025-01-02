import ErrorHandler from "../middlewares/errorMiddleware.js";
import applicationModel from "../models/applicationModel.js";
import { v2 as cloudinary } from "cloudinary";
import jobModel from "../models/jobModel.js";

export const createApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, coverLetter } = req.body;
    if (!name || !email || !phone || !address || !coverLetter) {
      return next(new ErrorHandler("All fields are required.", 400));
    }
    const jobSeekerInfo = {
      id: req.user._id,
      name,
      email,
      phone,
      address,
      coverLetter,
      role: "Job Seeker",
    };
    const jobDetails = await jobModel.findById(id);
    if (!jobDetails) {
      return next(new ErrorHandler("Job not found.", 404));
    }
    const isAlreadyApplied = await applicationModel.findOne({
      "jobInfo.jobId": id,
      "jobSeekerInfo.id": req.user._id,
    });
    if (isAlreadyApplied) {
      return next(
        new ErrorHandler("You have already applied for this job.", 400)
      );
    }
    if (req.files && req.files.resume) {
      const { resume } = req.files;
      try {
        const cloudinaryResponse = await cloudinary.uploader.upload(
          resume.tempFilePath,
          {
            folder: "Job_Seekers_Resume",
          }
        );
        if (!cloudinaryResponse || cloudinaryResponse.error) {
          return next(
            new ErrorHandler("Failed to upload resume to cloudinary.", 500)
          );
        }
        jobSeekerInfo.resume = {
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        };
      } catch (error) {
        return next(new ErrorHandler("Failed to upload resume", 500));
      }
    } else {
      if (req.user && !req.user.resume.url) {
        return next(new ErrorHandler("Please upload your resume.", 400));
      }
      jobSeekerInfo.resume = {
        public_id: req.user && req.user.resume.public_id,
        url: req.user && req.user.resume.url,
      };
    }
    const employerInfo = {
      id: jobDetails.postedBy,
      role: "Employer",
    };
    const jobInfo = {
      jobId: id,
      jobTitle: jobDetails.title,
    };
    const application = await applicationModel.create({
      jobSeekerInfo,
      employerInfo,
      jobInfo,
    });
    res.status(201).json({
      success: true,
      message: "Application submitted.",
      application,
    });
  } catch (error) {
    next(error);
  }
};
export const employerGetAllApplication = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const applications = await applicationModel.find({
      "employerInfo.id": _id,
      "deletedBy.employer": false,
    });
    res.status(200).json({
      success: true,
      message: "Applications fetched successfully.",
      applications,
    });
  } catch (error) {
    next(error);
  }
};
export const seekerGetAllApplication = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const applications = await applicationModel.find({
      "jobSeekerInfo.id": _id,
      "deletedBy.jobSeeker": false,
    });
    res.status(200).json({
      success: true,
      message: "Applications fetched successfully.",
      applications,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);
    const application = await applicationModel.findById(id);
 
    if (!application) {
      return next(new ErrorHandler("Application not found.", 404));
    }
    const role = req.user.role;
    console.log(role);
    switch (role) {
      case "Employer":
        application.deletedBy.employer = true;
        await application.save();

        return res.status(200).json({
          success: true,
          message: "Application deleted successfully.",
          application,
        });

      case "Seeker":
        application.deletedBy.jobSeeker = true;
        await application.save();
        return res.status(200).json({
          success: true,
          message: "Application deleted successfully.",
          application,
        });
      default: 
    }

    if (application.deletedBy.employer || application.deletedBy.jobSeeker) {
      await applicationModel.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: "Application deleted successfully.",
        application,
      });
    }
  
  } catch (error) {
    next(error);
  }
};
