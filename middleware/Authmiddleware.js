import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const Authmiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ msg: "Unauthorised HTTP,  token not provided" });
  }
  const jwtToken = token.replace("Bearer", "").trim();
  try {
    const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    const userdata = await User.findOne({ email: isVerified.email }).select(
      "-password"
    );
    req.user = userdata;
    req.token = jwtToken;
    req.userId = userdata._id.toString();
    next();
  } catch (error) {
    return res.status(401).json({ msg: "unauthorized , invalid token" });
  }
};

export default Authmiddleware;
