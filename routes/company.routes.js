import express from "express";
import {
  isAuthenticated,
  isEmployer,
} from "../middleware/isAuthenticated.js";
import validate from "../middleware/validator.middleware.js";
import Joi from "joi";
import {
  deleteCompany,
  getCompany,
  getCompanyByID,
  registerCompany,
  updateCompany,
} from "../controllers/company.controller.js";
/**
 * Company Schema validate
 */
// register company Schema
export const registerCompanySchema = Joi.object({
  companyname: Joi.string().required(),
  description: Joi.string().required(),
  website: Joi.string().required(),
  socialmedia: Joi.string().required(),
});

/**
 * companey Routes
 */
const router = express.Router();
//Register Company Routers
router.post(
  "/register",
  isAuthenticated,
  isEmployer,
  validate(registerCompanySchema),
  registerCompany
);
// Get all companies
router.get("/", isAuthenticated, isEmployer, getCompany);
// Get Company By Id
router.get("/:id", getCompanyByID);
//Update company By Id
router.put("/:id", isAuthenticated, isEmployer, updateCompany);
//delete Company By Id
router.delete("/:id", isAuthenticated, isEmployer, deleteCompany);
export default router;
