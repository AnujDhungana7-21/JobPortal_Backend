import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import { Company } from "../model/company.model.js";
/**
 * Register Company for employees
 */
export const registerCompany = catchAsyncError(async (req, res, next) => {
  let { companyname, description, website, socialmedia } = req.body;
  const userid = req.id;
  companyname.trim().toLowerCase();
  const match = await Company.findOne({ companyname });
  if (match) {
    return next(
      ErrorHandler.duplicate(
        "Company name is already Taken. please Try Another Name"
      )
    );
  }
  const newCompany = await Company.create({
    companyname,
    description,
    website,
    socialmedia,
    userid,
  });
  return res.status(201).json({
    message: "Company register Successfully",
    newCompany,
    success: true,
  });
});

/**
 * get all companies of valid employee
 */
export const getCompany = catchAsyncError(async (req, res, next) => {
  const userId = req.id;
  // console.log(userId);

  const companies = await Company.find({ userid: userId });
  if (!companies) {
    return next(ErrorHandler.notFound("Companies not found"));
  }
  return res.status(200).json({
    companies,
    success: true,
  });
});

// /**
//  * get company by id for jobseeker
//  */
export const getCompanyByID = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const findCompany = await Company.findById({ _id: id });
  if (!findCompany) {
    return next(ErrorHandler.notFound("company not Found"));
  }
  return res.status(200).json({
    findCompany,
    success: false,
  });
});

// /**
//  * Update company for valid employee
//  */

export const updateCompany = catchAsyncError(async (req, res, next) => {
  const userid = req.id; // from is Authenticated middleware
  const id = req.params.id; // id is comming from params

  const Data = await Company.findOneAndUpdate(
    { _id: id, userid },
    {
      ...req.body,
      logo
    },
    { new: true }
  );
  if (!Data) {
    return next(
      ErrorHandler.notFound(
        "Company not found or You donnot have permission to Update"
      )
    );
  }
  return res.status(200).json({
    message: "Successfully updated",
    Data,
    success: true,
  });
});

/**
 * delete company for valid employee
 */
export const deleteCompany = catchAsyncError(async (req, res, next) => {
  const userid = req.id;
  const id = req.params.id;
  // Check if the company exists with valid user
  const match = await Company.findOne({ _id: id, userid });
  if (!match) {
    return next(
      ErrorHandler.notFound(
        "Company not found or You donnot have permission to delete"
      )
    );
  }

  // Delete the company
  await Company.findByIdAndDelete(id);

  return res.status(200).json({
    message: "Company deleted successfully",
    success: true,
  });
});
