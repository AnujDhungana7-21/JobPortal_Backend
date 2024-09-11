import express from "express";
import Joi from "joi";
import {
  login,
  logout,
  register,
  updateProfile,
  forgetPassword,
  deleteUser,
} from "../controllers/user.controller.js";
import { isAuthenticated, isEmployer, isJobseeker } from "../middleware/isAuthenticated.js";
import validate from "../middleware/validator.middleware.js";

// Register Schema
const userRegisterSchema = Joi.object({
  fullname: Joi.string().min(3).required(),
  contact: Joi.number().required(),
  password: Joi.string().min(7).required(),
  role: Joi.string().required().valid("Jobseeker", "employer"),
  email: Joi.string().email().required(),
});

// Login Schema
const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().required().valid("Jobseeker", "employer"),
});

// Forgot Password Schema
const forgotpasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const router = express.Router();

// Apply validation middleware to routes where necessary
router.post("/register", validate(userRegisterSchema), register);
router.post("/login", validate(userLoginSchema), login);
router.get("/logout", isAuthenticated, logout);
router.delete("/delete", isAuthenticated, deleteUser);
router.post("/profile/update", isAuthenticated, updateProfile);
router.post("/forgotpassword", validate(forgotpasswordSchema), forgetPassword);

export default router;
