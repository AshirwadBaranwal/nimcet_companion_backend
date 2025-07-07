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

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  console.log({ email, otp });

  const user = await User.findOne({ email });

  if (!user || !user.otp || user.otp !== otp) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  if (user.otpExpires < Date.now()) {
    throw new ApiError(400, "OTP expired");
  }

  // Mark user as verified
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  try {
    // Log user in immediately
    console.log("Generating token for verified user:", {
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin,
    });

    const token = user.generateToken();
    console.log("Token generated successfully, length:", token.length);

    const isProduction = process.env.NODE_ENV === "production";

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    console.log("Setting cookie with options:", cookieOptions);
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      message: "OTP verified and logged in successfully",
      userId: user._id,
      isVerified: user.isVerified,
    });

    console.log("OTP verification response sent successfully");
  } catch (error) {
    console.error("Token generation error:", error);
    throw new ApiError(500, "Error generating authentication token");
  }
});

// ---------------------------
// LOGIN
// ---------------------------
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "User not found");

  const isValid = await user.comparePassword(password);
  if (!isValid) throw new ApiError(401, "Invalid credentials");

  const isVerified = user.isVerified;
  if (isVerified) {
    try {
      console.log("Generating token for user:", {
        id: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin,
      });

      const token = user.generateToken();
      console.log("Token generated successfully, length:", token.length);

      const isProduction = process.env.NODE_ENV === "production";
      console.log("Environment:", {
        isProduction,
        NODE_ENV: process.env.NODE_ENV,
      });

      // Set cookie options
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      };

      console.log("Setting cookie with options:", cookieOptions);

      res.cookie("token", token, cookieOptions);
      res.status(200).json({
        msg: "Login successful",
        userId: user._id,
        isVerified: user.isVerified,
      });
      console.log("Login response sent successfully");
    } catch (error) {
      console.error("Token generation error:", error);
      throw new ApiError(500, "Error generating authentication token");
    }
  } else {
    res.status(200).json({
      userId: user._id,
      isVerified: user.isVerified,
      msg: "Not verified,Verify first",
    });
  }
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
// RESTART VERIFICATION
//------------------------------------------
export const restartVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  // Generate new OTP
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  user.isVerified = false; // Mark as unverified again
  await user.save();

  // Send email with OTP
  await sendEmail(email, "Email Verification", generateOTPEmail(otp));

  res.status(200).json({
    msg: "Verification process restarted. OTP sent to your email.",
    email: user.email,
  });
});

//------------------------------------------
// USER DATA
//------------------------------------------
export const user = asyncHandler(async (req, res) => {
  console.log("User route accessed");

  try {
    // Check if req.user exists
    if (!req.user) {
      console.error("req.user is undefined or null");
      throw new ApiError(500, "User data not available");
    }

    console.log("User data retrieved successfully:", {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      isVerified: req.user.isVerified,
      isAdmin: req.user.isAdmin,
    });

    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in user route:", error);
    throw error;
  }
});
//------------------------------------------
// USER DATA
//------------------------------------------

export const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const allowedFields = ["username", "phone", "dob", "state", "city"];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select("-password -otp -otpExpiry");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: updatedUser,
  });
});

//------------------------------------------
// LOGOUT
//------------------------------------------
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "Logged out" });
});
