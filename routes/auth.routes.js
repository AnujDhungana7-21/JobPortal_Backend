import express from "express";
import {
  login,
  logout,
  register,
  updateProfile,
  forgetPassword,
} from "../controllers/user.controller.js";
import isValidate from "../middleware/isvalidate.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isValidate, logout);
router.post("/profile/update", isValidate, updateProfile);
router.post("/forgotpassword", forgetPassword);

export default router;
