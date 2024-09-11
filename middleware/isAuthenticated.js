import jwt from "jsonwebtoken";
import ErrorHandler from "./error.js";
import { catchAsyncError } from "./catchAsyncError.js";
import User from "../model/user.model.js";
import { ROLES } from "../utils/constant.js";

//Authenticated
export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return next(ErrorHandler.allErrors("User is Unauthenticated", 401));
  }
  const decode = await jwt.verify(token, process.env.SECRET_KEY);
  if (!decode) {
    return next(ErrorHandler.allErrors("Invalid Token",401));
  }
  // console.log(decode.userId);
  req.id = decode.userId;
  next();
});

// authorized jobseeker
export const isJobseeker = catchAsyncError(async (req, res, next) => {
  const userId = req.id;
  const user = await User.findById({ _id: userId });
  if (!user) {
    return next(ErrorHandler.allErrors("User not Found", 404));
  }
  if (user.role !== ROLES[0]) {
    return next(
      ErrorHandler.allErrors("Access Denied only for Jobseeker", 403)
    );
  }
  next();
});

// authorized employer
export const isEmployer = catchAsyncError(async (req, res, next) => {
  const userId = req.id;
  const user = await User.findById({ _id: userId });
  if (!user) {
    return next(ErrorHandler.allErrors("User not Found", 404));
  }
  if (user.role !== ROLES[1]) {
    return next(ErrorHandler.allErrors("Access Denied only for Employer", 403));
  }
  next();
});
