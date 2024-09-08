import mongoose from "mongoose";
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    Experience: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["intern", "Entry", "Junior", "Mid", "Senior"],
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    Qualification: {
      type: String,
      required: true,
    },
    requirement: [{ type: String }],
    jobtype: {
      type: String,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      // required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
