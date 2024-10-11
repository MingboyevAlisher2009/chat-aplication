import { compare } from "bcrypt";
import User from "../models/user.model.js";
import { generateToken } from "../utils/token.js";
import { renameSync, unlinkSync } from "fs";

export const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(400).json({ error: "User already exist" });
    }

    const data = await User.create(req.body);
    const token = generateToken(email, data._id);
    return res.json({
      data,
      token,
      success: true,
      message: "Successfuly",
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const data = await User.findOne({ email });

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    const auth = await compare(password, data.password);

    if (!auth) {
      return res.status(400).json({ error: "Your password is incorrect" });
    }

    const token = generateToken(email, data._id);
    return res.json({ data, token, success: true, message: "Successfuly" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const userInfo = async (req, res) => {
  try {
    const userData = await User.findById(req.user.userId).select("-password");

    if (!userData) res.status(404).json({ error: "User not found!" });
    res.json(userData);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, color } = req.body;

    if (!firstName || !lastName || !color)
      res
        .status(404)
        .json({ error: "First name, last name and color is required." });

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true }
    ).select("-password");

    res.json(userData);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const addProfileImage = async (req, res) => {
  try {
    if (!req.file) res.status(400).json({ error: "File is required" });

    const date = Date.now();
    let fileName = "uploads/profiles/" + date + req.file.originalname;

    renameSync(req.file.path, fileName);

    const updateUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        image: fileName,
      },
      { new: true, runValidators: true }
    ).select("image");

    res.json(updateUser);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const removeProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) res.status(404).json({ error: "User not found" });

    if (user.image) {
      unlinkSync(user.image);
    }

    user.image = null;

    await user.save();

    res.json({ message: "Profile image removed successfuly" });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
