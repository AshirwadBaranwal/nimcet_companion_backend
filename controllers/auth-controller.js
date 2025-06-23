import User from "../models/userModel.js";

//-----------
//HOME
//-----------

export const home = async (req, res) => {
  try {
    res.status(200).send("We are on home page of studymat");
  } catch (error) {
    console.log(error);
  }
};

//------------
// register
//------------

export const register = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).send({ message: "user already exists." });
    }

    const userCreated = await User.create({ username, email, phone, password });
    const token = await userCreated.generateToken();
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: true, // set to true in production
    });
    res.status(200).json({
      msg: "registered successfully",
      userID: userCreated._id.toString(),
    });
  } catch (error) {
    console.log(error);
  }
};

//-------------
// Login
//------------

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(401).json({ message: "Bad credentils" });
    }

    const user = await userExist.comparePassword(password);
    if (user) {
      const token = await userExist.generateToken();
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });
      res.status(200).json({
        msg: "Login Successfull",
        userId: userExist._id.toString(),
      });
    } else {
      return res.status(401).json({ message: "email or password is invalid." });
    }
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

//------------------------------------------
// getting user data-user route controller
//------------------------------------------

export const user = async (req, res) => {
  try {
    const userdata = req.user;
    return res.status(200).json(userdata);
  } catch (error) {
    console.log("error from user Router", error);
  }
};
//------------------------------------------
// getting user data-user route controller
//------------------------------------------

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "Logged out" });
};
