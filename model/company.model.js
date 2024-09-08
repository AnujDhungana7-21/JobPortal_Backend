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
      type: String,
      default:
        "https://media.istockphoto.com/id/1227201887/photo/3d-shield-front-view-metal-shield-golden-shield-3d-shield.jpg?s=1024x1024&w=is&k=20&c=hpRz78iaI7JM0CIVDpZnEkrRdW8HvDqLBeExeNE7CZs=", //url of logo
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
