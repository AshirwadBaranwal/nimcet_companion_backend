import express from "express";
import Authmiddleware from "../middleware/Authmiddleware.js";
import {
  home,
  login,
  logout,
  register,
  resendOTP,
  restartVerification,
  user,
  verifyOTP,
} from "../controllers/auth-controller.js";

const authRouter = express.Router();

authRouter.route("/").get(home);
authRouter.route("/register").post(register);
authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/resend-otp", resendOTP);
authRouter.route("/login").post(login);
authRouter.route("/logout").post(logout);
authRouter.post("/restart-verification", restartVerification);
authRouter.route("/user").get(Authmiddleware, user);

export default authRouter;
