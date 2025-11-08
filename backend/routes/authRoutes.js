// Import the Express framework
const express = require("express");

// Import user authentication and profile controller functions
const {
  registerUser,
  loginUser,
  getProfile,
  updateUserProfile,
} = require("../controllers/authController");

// Import the 'protect' middleware for route protection
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router(); // Initialize the Express router

// Define public routes for user registration and login
router.post("/register", registerUser);
router.post("/login", loginUser);

// Define protected routes that require a valid JWT token (using 'protect' middleware)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateUserProfile);

module.exports = router; 
