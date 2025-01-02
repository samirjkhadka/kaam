import ErrorHandler from "../middlewares/errorMiddleware.js";
import jobModel from "../models/jobModel.js";
import userModel from "../models/userModel.js";

export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      jobType,
      companyName,
      location,
      description,
      introduction,
      responsibilities,
      qualifications,
      offers,
      salary,
      experience,
      isHiringMultipleCandidates,
      companyWebsiteTitle,
      companyWebsiteUrl,
      jobNiches,
      isNewsLettersSent,
    } = req.body;

    if (!title) {
      return next(new ErrorHandler("Please enter title", 400));
    }

    if (!jobType) {
      return next(new ErrorHandler("Please enter jobType", 400));
    }

    if (!companyName) {
      return next(new ErrorHandler("Please enter companyName", 400));
    }

    if (!location) {
      return next(new ErrorHandler("Please enter location", 400));
    }

    if (!description) {
      return next(new ErrorHandler("Please enter description", 400));
    }

    if (!responsibilities) {
      return next(new ErrorHandler("Please enter responsibilities", 400));
    }

    if (!qualifications) {
      return next(new ErrorHandler("Please enter qualifications", 400));
    }

    if (!salary) {
      return next(new ErrorHandler("Please enter salary", 400));
    }

    if (!experience) {
      return next(new ErrorHandler("Please enter experience", 400));
    }

    if (!jobNiches) {
      return next(new ErrorHandler("Please enter jobNiches", 400));
    }

    //if companywebsite is present then check if title and url is present
    if (companyWebsiteTitle && companyWebsiteUrl) {
      if (!companyWebsiteTitle) {
        return next(new ErrorHandler("Please enter companyWebsiteTitle", 400));
      }

      if (!companyWebsiteUrl) {
        return next(new ErrorHandler("Please enter companyWebsiteUrl", 400));
      }
    }

    const postedBy = req.user._id;
    const job = await jobModel.create({
      title,
      jobType,
      companyName,
      location,
      description,
      introduction,
      responsibilities,
      qualifications,
      offers,
      salary,
      experience,
      isHiringMultipleCandidates,
      companyWebsite: { title: companyWebsiteTitle, url: companyWebsiteUrl },
      jobNiches,
      isNewsLettersSent,
      postedBy,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully.",
      job,
      code: 0,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllJobs = async (req, res, next) => {
  const { city, niche, searchKeyword } = req.query;
  const query = {};

  if (city) {
    query.location = city;
  }

  if (niche) {
    query.jobNiches = niche;
  }

  if (searchKeyword) {
    query.$or = [
      { title: { $regex: searchKeyword, $options: "i" } },
      { companyName: { $regex: searchKeyword, $options: "i" } },
      { description: { $regex: searchKeyword, $options: "i" } },
      { location: { $regex: searchKeyword, $options: "i" } },
    ];
  }

  try {
    const jobs = await jobModel.find(query);
    res.status(200).json({
      success: true,
      message: "Jobs fetched successfully.",
      jobs,
      count: jobs.length,
      code: 0,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await jobModel.findById(id);

    if (!job) {
      return next(new ErrorHandler("Job not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Job fetched successfully.",
      job,
      code: 0,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyJobs = async (req, res, next) => {
  try {
    const myJobs = await jobModel.find({ postedBy: req.user._id });
    res.status(200).json({
      success: true,
      message: "Jobs fetched successfully.",
      myJobs,
      count: myJobs.length,
      code: 0,
    });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await jobModel.findById(id);

    if (!job) {
      return next(new ErrorHandler("Job not found", 404));
    }

    const updatedJob = await jobModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      message: "Job updated successfully.",
      updatedJob,
      code: 0,
    });

    if (!updatedJob) {
      return next(new ErrorHandler("Job not found", 404));
    }

    if (updatedJob.postedBy.toString() !== req.user._id.toString()) {
      return next(
        new ErrorHandler("You are not authorized to update this job", 401)
      );
    }

    if (updatedJob.isNewsLettersSent) {
      if (updatedJob.isHiringMultipleCandidates) {
        const jobNiches = updatedJob.jobNiches;
        const jobNichesArray = jobNiches.split(",");
        for (let i = 0; i < jobNichesArray.length; i++) {
          const niche = jobNichesArray[i].trim();
          const nicheJobs = await jobModel.find({ jobNiches: niche });
          for (let j = 0; j < nicheJobs.length; j++) {
            const job = nicheJobs[j];
            if (job.postedBy.toString() !== req.user._id.toString()) {
              job.isNewsLettersSent = false;
              await job.save();
            }
          }
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await jobModel.findById(id);

    if (!job) {
      return next(new ErrorHandler("Job not found", 404));
    }
    await jobModel.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
      code: 0,
    });
  } catch (error) {
    next(error);
  }
};
