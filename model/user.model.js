import mongoose from "mongoose";
import { ROLES } from "../utils/constant.js";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    contact: {
      type: Number,
      required: true,
      minlength: 10,
    },
    email: {
      type: String,
      validate: {
        validator: async (value) => {
          let matched = await mongoose.models.User.findOne({
            email: value,
          });
          if (matched) {
            return false;
          }
        },
        message: "Email already exists",
      },
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      select: false,
    },
    role: {
      type: String,
      enum: ROLES, //ROLES is array in ../utils/constant.js file
      required: true,
    },
    profile: {
      bio: { type: String },
      skills: [{ type: String }],
      resume: { type: String },
      resumeOriginaName: { type: String },
      company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
      profilePhoto: { type: String, default: "" },
    },
    resetToken: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
export default User;
