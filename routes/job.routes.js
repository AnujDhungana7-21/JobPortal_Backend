import express from "express";
import {
  deleteJob,
  getAllJob,
  getJobByAdmin,
  getJobById,
  registerJob,
  updateJob,
} from "../controllers/job.controller.js";
import {
  isAuthenticated,
  isEmployer,
} from "../middleware/isAuthenticated.js";
const router = express.Router();
// register Job
router.post("/register", isAuthenticated, isEmployer, registerJob);
// get All jobs for jobseeker
router.get("", getAllJob);
// get job by Id for jobseeker
router.get("/get/:id", getJobById);
//get jobs by Admin this will show how many job is created by valid admin
router.get("/admin", isAuthenticated, isEmployer, getJobByAdmin);
//Update Job
router.put("/update/:id", isAuthenticated, isEmployer, updateJob);
//delete job
router.delete("/delete/:id", isAuthenticated, isEmployer, deleteJob);
export default router;
