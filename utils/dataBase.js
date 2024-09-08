import mongoose from "mongoose";

const mongoConnection = async () => {
  try {
    await mongoose.connect(process.env.MongoDb_BaseUrl, {});
    console.log("MongoDB Connected!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1); // Exit process with failure
  }
};

export default mongoConnection;
