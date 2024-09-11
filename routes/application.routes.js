import express from "express";
import validate from "../middleware/validator.middleware.js";
import Joi from "joi";
import {
  applyJob,
  getApplicent,
  getAppliedJobs,
  updateApplicantStatus,
} from "../controllers/application.controllers.js";
import { isAuthenticated, isEmployer, isJobseeker } from "../middleware/isAuthenticated.js";


const updateStatusSchema = Joi.object({
  status: Joi.string().required(),
});
/**
 * Application Routes
 */
const router = express.Router();
//Apply job -jobseeker
router.get("/apply/:id", isAuthenticated, isJobseeker, applyJob);
// Get all applied jobs -jobseeker
router.get("/applied", isAuthenticated, isJobseeker, getAppliedJobs);
// Get applicents -emp
router.get("/:id", isAuthenticated, isEmployer, getApplicent);
//Update status of applicant -emp
router.post(
  "/status/:id",
  isAuthenticated,
  isEmployer,
  validate(updateStatusSchema),
  updateApplicantStatus
);
export default router;
