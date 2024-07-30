import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi from "joi";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
/**
 * Register new user in database
 */
export const register = async (req, res) => {
  /**
   * server side validation for Register
   */
  // const validateUserRegister = Joi.object({
  //   fullname: Joi.string().min(3).required(),
  //   contact: Joi.number().required(),
  //   password: Joi.string()
  //     .pattern(new RegExp("^[a-zA-Z0-9]"))
  //     .min(8)
  //     .max(20)
  //     .required(),
  //   role: Joi.string().required().valid("Jobseeker", "employer"),
  //   email: Joi.string().email().required(),
  // });
  // try {
  //   await validateUserRegister.validateAsync(req.body, {
  //     abortEarly: false,
  //     allowUnknown: true,
  //   });
  // } catch (error) {
  //   return res.status(400).json({
  //     message: error.message,
  //     success: false,
  //   });
  // }

  /**
   * logic and business modal
   */
  try {
    const { fullname, contact, email, password, role } = req.body;
    //hash the password using bcryptjs
    const hashPassword = await bcrypt.hash(password, 10);
    //create a new user
    await User.create({
      fullname,
      contact,
      email,
      password: hashPassword,
      role,
    });
    res.status(201).json({
      message: "User Created Successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "server Error",
      status: false,
    });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  /**
   * server side validation for Register
   */
  const validateUserLogin = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().required().valid("Jobseeker", "employer"),
  });
  try {
    await validateUserLogin.validateAsync(req.body, { abortEarly: false });
  } catch (err) {
    return res.status(400).json({
      message: err.message,
      success: false,
    });
  }

  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "All field is required",
        success: false,
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Email & Password",
        success: false,
      });
    }
    /**
     * compare hash password of user
     */
    const isPasswordMatch = await bcrypt
      .compare(password, user.password)
      .select("+password");
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Invalid Email & Password",
        success: false,
      });
    }
    /**
     * check role
     */
    if (role !== user.role) {
      return res.status(400).json({
        message: "Account Doesn`t exists with Current Role",
        success: false,
      });
    }
    const tokenDate = {
      userId: user._id,
    };
    const token = jwt.sign(tokenDate, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });
    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      contact: user.contact,
      role: user.role,
      profile: user.profile,
    };
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpsOnly: true,
        samesite: "strict",
      })
      .json({
        message: `Welcome ${user.fullname}`,
        user,
        success: true,
      });
  } catch (error) {
    res.status(500).json({
      error: err.message,
      message: "server Error",
      status: false,
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, contact, bio, skills } = req.body;
    let skillsArray;
    if (skills) {
      skillsArray = skills.split(",");
    }
    const userId = req.id; //req.id is coming from isvalidate middleware
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
        success: false,
      });
    }
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (contact) user.contact = contact;
    if (bio) user.bio = bio;
    if (skills) user.skills = skillsArray;
    await user.save();
    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      contact: user.contact,
      role: user.role,
      profile: user.profile,
    };
    return res.status(200).json({
      message: "User Update Successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: err.message,
      message: "server Error",
      status: false,
    });
  }
};

/**
 * logout user
 */
export const logout = (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logout Successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Internal Server Error",
      success: false,
    });
  }
};
/**
 * email config
 */

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  secure: process.env.NODEMAILER_PORT == 465, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSCODE,
  },
});

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
          console.log("Email sent.", info.response);
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
    console.error(error);
    return res.status(500).json({
      error: error.message,
      message: "Internal server error",
      success: false,
    });
  }
};
