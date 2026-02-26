"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import the Express framework
const express_1 = __importDefault(require("express"));
// Import user authentication and profile controller functions
const authController_1 = require("../controllers/authController");
// Import the 'protect' middleware for route protection
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router(); // Initialize the Express router
// Define public routes for user registration and login
router.post("/register", authController_1.registerUser);
router.post("/login", authController_1.loginUser);
// Define protected routes that require a valid JWT token (using 'protect' middleware)
router.get("/profile", authMiddleware_1.protect, authController_1.getProfile);
router.put("/profile", authMiddleware_1.protect, authController_1.updateUserProfile);
exports.default = router;
