import User from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

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

  const userExist = await User.findOne({ email });
  if (userExist) {
    throw new ApiError(400, "User already exists.");
  }

  const userCreated = await User.create({ username, email, phone, password });
  const token = await userCreated.generateToken();
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    msg: "Registered successfully",
    userID: userCreated._id.toString(),
  });
});

//-------------
// LOGIN
//------------
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const userExist = await User.findOne({ email });
  if (!userExist) {
    throw new ApiError(401, "Bad credentials");
  }

  const user = await userExist.comparePassword(password);
  if (!user) {
    throw new ApiError(401, "Email or password is invalid.");
  }

  const token = await userExist.generateToken();
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    msg: "Login Successful",
    userId: userExist._id.toString(),
  });
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
