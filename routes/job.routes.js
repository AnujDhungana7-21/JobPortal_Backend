import express from "express";
import {
  createJob,
  deleteJob,
  fetchJob,
  updateJob,
} from "../controllers/job.controller";
const router = express.Router();
router.get("", fetchJob);
router.post("", createJob);
router.patch("", updateJob);
router.delete("", deleteJob);

export default router;
