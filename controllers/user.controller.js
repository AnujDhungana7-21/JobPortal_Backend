import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi from "joi";
import dotenv from "dotenv";
import { transporter } from "../utils/emailConfig.js";
import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
dotenv.config();
/**
 * Register new user in database
 */
export const register = catchAsyncError(async (req, res, next) => {
  /**
   * logic and business modal
   */

  const { fullname, contact, email, password, role } = req.body;
  const userExists = await User.findOne({ email: email });
  if (userExists) {
    return next(
      ErrorHandler.duplicate(
        "Email already exists from this email.Please Try with another one"
      )
    );
  }
  //hash the password using bcryptjs
  const hashPassword = await bcrypt.hash(password, 10);
  //create a new user
  await User.create({
    ...req.body,
    password: hashPassword,
  });
  const userWithOutPassword = await User.findOne({ email }).select("-password");
  return res.status(201).json({
    message: "User Created Successfully",
    success: true,
    user: userWithOutPassword,
  });
});

/**
 * Login user
 */
export const login = catchAsyncError(async (req, res, next) => {
  const { email, password, role } = req.body;
  // console.log(req.body);

  const user = await User.findOne({ email: email }).select("+password");
  // console.log(user);

  if (!user) {
    return next(ErrorHandler.unauthorized("Invalid Email & Password"));
  }
  /**
   * compare hash password of user
   */
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return next(ErrorHandler.unauthorized("Invalid Email & Password"));
  }
  /**
   * check role
   */
  if (role !== user.role) {
    return next(
      ErrorHandler.unauthorized("Account Doesnot match with current Role")
    );
  }
  //generate token using JWT
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });
  // remove password
  const userWithOutPassword = await User.findOne({ email }).select("-password");

  return res
    .status(200)
    .cookie("token", token, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpsOnly: true,
      samesite: "strict",
    })
    .json({
      message: `Welcome ${user.fullname}`,
      user: userWithOutPassword,
      success: true,
    });
});
/**
 * Update user profile
 */
export const updateProfile = catchAsyncError(async (req, res) => {
  const { fullname, email, contact, bio, skills } = req.body;
  let skillsArray;
  if (skills) {
    skillsArray = skills.split(",");
  }
  const userId = req.id;
  //req.id is coming from isAuthenticated middleware
  let user = await User.findByIdAndUpdate(
    userId,
    { fullname, email, contact, bio, skills: skillsArray },
    { new: true }
  );
  if (!user) {
    return next(ErrorHandler.notFound("User Not Found"));
  }
  return res.status(200).json({
    message: "User Update Successfully",
    success: true,
    user,
  });
});

/**
 * delete User Profile
 * but user Information is only deleted after 30days
 */
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const userId = req.id; //coming from is Authenticated middleware
  console.log(userId);

  const matchUserId = await User.findById(userId);
  if (!matchUserId) {
    return next(ErrorHandler.notFound("User Not found"));
  }
  await User.findByIdAndDelete(userId);
  res.status(204).cookie("token", "", { maxAge: 0 }).json({
    status: true,
    message: "User Deleted",
  });
});

/**
 * logout user
 */
export const logout = catchAsyncError(async (req, res, next) => {
  return res.status(200).cookie("token", "", { maxAge: 0 }).json({
    message: "Logout Successfully",
    success: true,
  });
});

/**
 * email config
 */

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const matched = await User.findOne({ email: email });
    if (!matched) {
      return res.status(404).json({
        message: "Email doesn't exist.",
      });
    }

    const token = jwt.sign({ _id: matched._id }, process.env.SECRET_KEY, {
      expiresIn: "120s",
    });

    const verifyToken = await User.findByIdAndUpdate(
      matched._id,
      { resetToken: token },
      { new: true }
    );

    if (!verifyToken) {
      return res.status(500).json({
        message: "Failed to generate reset token.",
      });
    }

    if (transporter) {
      const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: "Forgot Password Reset Link",
        html: `<h1>The given link will be valid for 2 minutes only.</h1>
               <p>Please click the link to reset your password: <a href="http://localhost:5173/api/user/forgotpassword/${matched._id}/${verifyToken.resetToken}">Reset Password</a></p>`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            message: "Failed to send email.",
            success: false,
          });
        } else {
          // console.log("Email sent.", info.response);
          return res.status(200).json({
            message: "Email sent successfully.",
            resetLink: info.response,
            success: true,
          });
        }
      });
    } else {
      return res.status(500).json({
        message: "Email transporter is not configured.",
        success: false,
      });
    }
  } catch (error) {
    next(error);
  }
};
