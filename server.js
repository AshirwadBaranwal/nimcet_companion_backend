import express from "express";
import dbconnect from "./db.js";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./route/auth-router.js";
import cookieParser from "cookie-parser";
import testRouter from "./route/test-router.js";
import errorMiddleware from "./middleware/errMiddleware.js";

dotenv.config({
  path: "./.env",
});

// Check for required environment variables
// const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET_KEY', 'PORT'];
// requiredEnvVars.forEach(varName => {
//   if (!process.env[varName]) {
//     console.error(`Error: Environment variable ${varName} is not set`);
//     process.exit(1);
//   }
// });

// console.log('Environment variables validated successfully');

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://nimcet-companion.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"], // Add this
    exposedHeaders: ["Set-Cookie"], // Add this
  })
);

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/v1", authRouter);
app.use("/api/v1/test", testRouter);

// 404 handler should be last
app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

app.use(errorMiddleware);

dbconnect().then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`server is running at port : ${process.env.PORT}`);
  });
});
