import jwt from "jsonwebtoken";
import User from "../models/User";
import { Request, Response } from "express";

// Helper: Generate JWT
const generateToken = (id: any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
};

// @desc Register new user
// @route POST /api/auth/register
// @access Public
export const registerUser = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Check if User Exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create User
    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        message: "User registered successfully",
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get current logged-in user
// @route GET /api/auth/profile
// @access Private
export const getProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isPro: user.isPro,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private
export const updateUserProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    user.name = req.body.name || user.name;
    user.avatar = req.body.avatar || user.avatar;

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
