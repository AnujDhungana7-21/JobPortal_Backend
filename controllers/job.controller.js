import { Job } from "../model/job.model.js";

export const createJob = (req, res) => {
  try {
    
  } catch (error) {}
};

/**
 * search job by
 * title
 * location
 * company
 */
export const fetchJob = async (req, res) => {
  try {
    const getJob = await Job.find({ title: new RegExp(req.query.q, "i") });
    return res.status(200).json({
      getJob,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      success: false,
    });
  }
};
export const updateJob = (req, res) => {
  try {
  } catch (error) {}
};
export const deleteJob = (req, res) => {
  try {
  } catch (error) {}
};
