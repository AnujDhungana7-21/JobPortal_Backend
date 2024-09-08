import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import { Application } from "../model/application.model.js";
import { Job } from "../model/job.model.js";
//apply for Job
export const applyJob = catchAsyncError(async (req, res, next) => {
  const userId = req.id;
  const jobId = req.params.id;
  //find if jobseeker already apply or not
  const applied = await Application.findOne({ applicant: userId, job: jobId });
  if (applied) {
    return next(ErrorHandler.duplicate("Already Apply"));
  }
  // find if job exites or not
  const findJob = await Job.findById(jobId);
  if (!findJob) {
    return next(ErrorHandler.notFound("Job not found"));
  }
  //create new Job
  const newApplication = await Application.create({
    job: jobId,
    applicant: userId,
  });
  //push the newapplication._id to applications which is create in job model
  findJob.applications.push(newApplication._id);
  await findJob.save();
  return res.status(201).json({
    message: "Job Apply Successfully",
    success: true,
  });
});

// get AppliedJobs for Jobseeker
export const getAppliedJobs = catchAsyncError(async (req, res, next) => {
  const userId = req.id;
  // find applied job by user
  // job is populate and again company is populate using nested populate in acc order
  const appliedJobs = await Application.find({
    applicant: userId,
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "job",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "company",
        options: { sort: { createdAt: -1 } },
      },
    });
  if (!appliedJobs) {
    return next(ErrorHandler.notFound("No Applications Found"));
  }
  return res.status(200).json({
    success: true,
    appliedJobs,
  });
});

// get applicents
export const getApplicent = catchAsyncError(async (req, res, next) => {
    
});
