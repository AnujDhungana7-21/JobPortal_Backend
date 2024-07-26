import express from "express";
import {
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/user.controller.js";
import isValidate from "../middleware/isvalidate.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isValidate, logout);
router.post("/profile/update", isValidate, updateProfile);

export default router;
