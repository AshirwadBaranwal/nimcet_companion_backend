import User from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateOTPEmail } from "../EmailTemplates/otpTemplate.js";

//----------------
// Generate Toekn
//----------------

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

//-----------
// HOME
//-----------
export const home = asyncHandler(async (req, res) => {
  res.status(200).send("We are on home page of studymat");
});

//------------
// REGISTER
//------------
export const register = asyncHandler(async (req, res) => {
  const { username, email, phone, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, "User already exists.");

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  const user = await User.create({
    username,
    email,
    phone,
    password,
    otp,
    otpExpires,
  });

  await sendEmail(email, "Verify Your Email", generateOTPEmail(otp));

  res.status(200).json({ msg: "OTP sent to email.", userId: user._id });
});

// ---------------------------
// VERIFY OTP
// ---------------------------

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log({ email, otp });
    const user = await User.findOne({ email });

    if (!user || !user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (user.otp.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    // Log user in immediately
    const token = user.generateToken(); // assume you have this
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24,
      })
      .json({ message: "OTP verified and logged in successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ---------------------------
// LOGIN
// ---------------------------
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "User not found");

  const isValid = await user.comparePassword(password);
  if (!isValid) throw new ApiError(401, "Invalid credentials");

  const token = user.generateToken();
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    msg: "Login successful",
    userId: user._id,
    isVerified: user.isVerified,
  });
});

// ---------------------------
// RESEND OTP
// ---------------------------
export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendEmail(email, "Resend OTP for verification", generateOTPEmail(otp));

  res.status(200).json({ msg: "OTP resent" });
});

//------------------------------------------
// USER DATA
//------------------------------------------
export const user = asyncHandler(async (req, res) => {
  const userdata = req.user;
  res.status(200).json(userdata);
});

//------------------------------------------
// LOGOUT
//------------------------------------------
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "Logged out" });
});
