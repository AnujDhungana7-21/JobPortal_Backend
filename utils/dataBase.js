import mongoose from "mongoose";
const mongoConnection = async () => {
  try {
    await mongoose.connect(process.env.MongoDb_BaseUrl, {});
    console.log("MongoDb Connected!");
  } catch (error) {
    console.log("MongoDb Error", error);
  }
};

export default mongoConnection;
