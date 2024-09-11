import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import { Application } from "../model/application.model.js";
import { Job } from "../model/job.model.js";
//apply for Job
export const applyJob = catchAsyncError(async (req, res, next) => {
  const userId = req.id;
  const jobId = req.params.id;
  // find if jobseeker already apply or not
  const applied = await Application.findOne({ applicant: userId, job: jobId });
  if (applied) {
    return next(ErrorHandler.allErrors("Already Apply", 400));
  }
  // find if job exites or not
  const findJob = await Job.findById(jobId);
  if (!findJob) {
    return next(ErrorHandler.allErrors("Job not found", 404));
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
    success: true,
    message: "Job Apply Successfully",
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
    return next(ErrorHandler.allErrors("No Applications Found", 404));
  }
  return res.status(200).json({
    success: true,
    appliedJobs,
  });
});

// get applicents for Employers
export const getApplicent = catchAsyncError(async (req, res, next) => {
  const jobId = req.params.id;
  const job = await Job.findById(jobId).populate({
    path: "applications",
    options: { sort: { createdAt: -1 } },
    populate: {
      path: "applicant",
    },
  });
  if (!job) {
    return next(ErrorHandler.allErrors("Job not Found", 404));
  }
  return res.status(200).json({
    success: false,
    job,
  });
});

// update status
export const updateApplicantStatus = catchAsyncError(async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params; //applicationId
  if (!status) {
    return next(ErrorHandler.allErrors("Status is Required", 400));
  }
  //find application by ApplicationId
  const application = await Application.findOne({ _id: id });
  if (!application) {
    return next(ErrorHandler.allErrors("Application not Found", 404));
  }
  //updateStatus
  application.status = status.toLowerCase();
  await application.save();
  return res.status(200).json({
    status: true,
    message: "Status Updated Successfully",
  });
});
