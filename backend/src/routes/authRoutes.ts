// Import the Express framework
import express from "express";

// Import user authentication and profile controller functions
import {
  registerUser,
  loginUser,
  getProfile,
  updateUserProfile,
} from "../controllers/authController";

// Import the 'protect' middleware for route protection
import { protect } from "../middlewares/authMiddleware";

const router = express.Router(); // Initialize the Express router

// Define public routes for user registration and login
router.post("/register", registerUser);
router.post("/login", loginUser);

// Define protected routes that require a valid JWT token (using 'protect' middleware)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateUserProfile);

export default router; 
