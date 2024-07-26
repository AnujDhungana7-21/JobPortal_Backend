import mongoose from "mongoose";
const companySchema = new mongoose.Schema(
  {
    companyname: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: true,
    },
    socialmedia: {
      type: String,
      required: true,
    },
    logo: {
      type: String, //uri of logo
    },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);
