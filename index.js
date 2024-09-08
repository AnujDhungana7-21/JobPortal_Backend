import express from "express";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoConnection from "./utils/dataBase.js";
import jobRouter from "./routes/job.routes.js";
import companyRouter from "./routes/company.routes.js";
import { errorMiddleware } from "./middleware/error.js";
import cluster from "cluster";
import os from "os";

dotenv.config();

const numCPUs = os.cpus().length;
// console.log(numCPUs);
const Port = Number(process.env.PORT) || 5000;

if (cluster.isMaster) {
  // Master process
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // When a worker dies, log it and fork a new worker
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Forking a new worker...`);
    cluster.fork();
  });
} else {
  // Worker processes
  const app = express();

  /**
   * Global Middleware & routes setup
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
  app.use("/api/company", companyRouter);
  app.use("/api/job", jobRouter);

  // Catch-all route for undefined routes
  app.all("*", (req, res) => {
    return res.status(400).json({
      message: "Bad request/Routes Not Found",
      success: false,
    });
  });

  /**
   * Error handler middleware
   */
  app.use(errorMiddleware);

  /**
   * Start listening for requests
   */
  app.listen(Port, () => {
    mongoConnection();
    // console.log(`Worker ${process.pid} started`);
    console.log("Server is Running on", `${process.env.Base_Url}${Port}`);
  });
}
