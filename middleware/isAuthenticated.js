import jwt from "jsonwebtoken";
import ErrorHandler from "./error.js";
import { catchAsyncError } from "./catchAsyncError.js";
const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return next(ErrorHandler.unauthorized("User is Unauthenticated"));
  }
  const decode = await jwt.verify(token, process.env.SECRET_KEY);
  if (!decode) {
    return next(ErrorHandler.unauthorized("Invalid Token"));
  }
  // console.log(decode.userId);
  req.id = decode.userId;
  next();
});
export default isAuthenticated;
