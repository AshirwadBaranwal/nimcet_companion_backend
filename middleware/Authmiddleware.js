import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const Authmiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new ApiError(401, "Unauthorized: Token not provided");
    }

    // Remove Bearer prefix if present
    const jwtToken = token.replace("Bearer", "").trim();

    // Log token details (without exposing the full token)
    console.log("Token verification attempt:", {
      tokenLength: jwtToken.length,
      tokenPrefix: jwtToken.substring(0, 10) + "...",
      secretKeyLength: process.env.JWT_SECRET_KEY
        ? process.env.JWT_SECRET_KEY.length
        : 0,
    });

    // Verify the token
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    console.log("Token decoded successfully:", {
      email: decoded.email,
      userID: decoded.userID,
      isAdmin: decoded.isAdmin,
    });

    // Find the user
    const userdata = await User.findOne({ email: decoded.email }).select(
      "-password"
    );

    if (!userdata) {
      throw new ApiError(401, "Unauthorized: User not found");
    }

    // Attach user data to request
    req.user = userdata;
    req.token = jwtToken;
    req.userId = userdata._id.toString();

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Unauthorized: Invalid token");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Unauthorized: Token expired");
    } else if (error instanceof ApiError) {
      throw error;
    } else {
      throw new ApiError(500, "Internal server error during authentication");
    }
  }
});

export default Authmiddleware;
