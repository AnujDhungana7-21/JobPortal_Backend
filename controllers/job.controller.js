import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import { Job } from "../model/job.model.js";

//for admin to Add Jobs
export const registerJob = catchAsyncError(async (req, res, next) => {
  const userId = req.id;

  // Create the job first
  let jobData = await Job.create({
    ...req.body,
    createdBy: userId,
  });

  // Populate the createdBy field
  // jobData = await jobData.populate("createdBy");

  return res.status(201).json({
    message: "Job is Created",
    success: true,
    jobData,
  });
});

/**
 * search job by
 * title
 * location
 * company
 */
//for Jobseeker
export const getAllJob = catchAsyncError(async (req, res, next) => {
  const search = req.query.search || "";
  const query = {
    $or: [
      { title: { $regex: search, $options: "i" } }, // Case-insensitive
      { location: { $regex: search, $options: "i" } },
      // { company: { $regex: search, $options: "i" } },
    ],
  };

  const getJobs = await Job.find(query).sort({ createdAt: -1 });
  if (!getJobs) return next(ErrorHandler.allErrors("Jobs Not Found", 404));
  return res.status(200).json({
    getJobs,
  });
});
// for jobseeker
export const getJobById = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const Data = await Job.findById({ _id: id });
  if (!Data) {
    return next(ErrorHandler.allErrors("Job Not Found", 404));
  }
  return res.status(200).json({
    success: true,
    Data,
  });
});

/**
 * for Admin to find How many Job have been created
 */
export const getJobByAdmin = catchAsyncError(async (req, res, next) => {
  const userId = req.id;
  const getJobs = await Job.find({ createdBy: userId });
  if (!getJobs || getJobs.length === 0) {
    return next(ErrorHandler.allErrors("Jobs Not found", 404));
  }
  return res.status(200).json({
    getJobs,
  });
});

/**
 * update Job with Authenticated user only
 */
export const updateJob = catchAsyncError(async (req, res, next) => {
  const userId = req.id;
  const jobId = req.params?.id;

  //find if job exists or not
  const matchJob = await Job.findById(jobId);
  if (matchJob) {
    return next(ErrorHandler.allErrors("Job not Found", 404));
  }
  /**
   * find the jobId  and createdBy id are made by same user or not
   */
  const match = await Job.findOneAndUpdate(
    { _id: jobId, createdBy: userId },
    { ...req.body },
    { new: true }
  );
  if (!match) {
    return next(
      ErrorHandler.allErrors("You do not have Permission to  Update a Job", 403)
    );
  }
  return res.status(200).json({
    match,
  });
});

/**
 * Delete Job with Authenticated user only
 */
export const deleteJob = catchAsyncError(async (req, res, next) => {
  const userId = req.id;
  const jobId = req.params?.id;
  // find if job exists or not
  const matchJob = await Job.findById(jobId);
  if (matchJob) {
    return next(ErrorHandler.allErrors("Job not Found", 404));
  }

  //find the jobId  and createdBy id are made by same user or not
  const match = await Job.findOne({ _id: jobId, createdBy: userId });
  if (!match) {
    return next(
      ErrorHandler.allErrors("You do not have Permission to Delete a Job", 403)
    );
  }
  await Job.deleteOne(jobId);
  return res.status(200).json({
    match,
  });
});
