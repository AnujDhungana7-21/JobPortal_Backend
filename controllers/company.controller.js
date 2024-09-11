import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import { Company } from "../model/company.model.js";
/**
 * Register Company by employees
 */
export const registerCompany = catchAsyncError(async (req, res, next) => {
  let { companyname, description, website, socialmedia, logo } = req.body;
  const userid = req.id;
  companyname.trim().toLowerCase();
  const match = await Company.findOne({ companyname });
  if (match) {
    return next(
      ErrorHandler.allErrors(
        "Company name is already Taken. please Try Another Name",
        400
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
    return next(ErrorHandler.allErrors("Companies not found", 404));
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
    return next(ErrorHandler.allErrors("company not Found", 404));
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

  // check if the Company Exists
  const companyExists = await Company.findById(id);
  if (!companyExists) return ErrorHandler.allErrors("Company not Found", 404);

  // Check if the company exists with valid user
  const Data = await Company.findOneAndUpdate(
    { _id: id, userid },
    {
      ...req.body,
      logo,
    },
    { new: true }
  );
  if (!Data) {
    return next(
      ErrorHandler.allErrors("You donot have permission to Update", 403)
    );
  }
  return res.status(200).json({
    message: "Company Successfully updated",
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

  // check if the Company Exists
  const companyExists = await Company.findById(id);
  if (!companyExists) return ErrorHandler.allErrors("Company not Found", 404);

  // Check if the company exists with valid user
  const match = await Company.findOne({ _id: id, userid: userid });
  if (!match) {
    return next(
      ErrorHandler.allErrors("You donot have permission to delete", 403)
    );
  }

  // Delete the company
  await Company.findByIdAndDelete(id);

  return res.status(200).json({
    message: "Company deleted successfully",
    success: true,
  });
});
