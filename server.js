import express from "express";
import dbconnect from "./db.js";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./route/auth-router.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://nimcet-companion.vercel.app"],
    methods: "GET, POST, PUT, PATCH, DELETE, HEAD ",
    Credentials: true,
  })
);

dotenv.config({
  path: "./.env",
});

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/v1", authRouter);

// 404 handler should be last
app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

dbconnect().then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`server is running at port : ${process.env.PORT}`);
  });
});
