import express from "express";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoConnection from "./utils/dataBase.js";
import jobRouter from "./routes/job.routes.js";
dotenv.config();
const app = express();

/**
 * Global Middlerware & routes setup
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
  origin: `${process.env.FRONTEND_BASE_URL}`,
  credentials: true,
};
app.use(cors(corsOptions));

/**
 * Other middleware and routes setup
 */
app.use("/api/user", authRouter);
app.use("/api/job", jobRouter);

/**
 * listen
 */
const Port = Number(process.env.PORT) || 5000;
app.listen(Port, () => {
  mongoConnection();
  console.log("Server is Running on", `${process.env.Base_Url}${Port}`);
});
