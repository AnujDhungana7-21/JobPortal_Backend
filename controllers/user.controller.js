import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Register new user in database
 */
export const register = async (req, res) => {
  try {
    const { fullname, contact, email, password, role } = req.body;
    if (!fullname || !contact || !email || !password || !role) {
      return res.status(400).json({
        message: "All field is required.",
        success: false,
      });
    }
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        message: "User already exists using this Email.",
        success: false,
      });
    }
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
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
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
    const isPasswordMatch = await bcrypt.compare(password, user.password);
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
    return res.status(500).json({
      message: error.message,
      success: false,
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
      message: error.message,
      success: false,
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
      message: error.message,
      success: false,
    });
  }
};
