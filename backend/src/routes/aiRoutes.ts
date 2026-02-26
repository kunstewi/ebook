import express from "express";
const router = express.Router();
import {
    generateChapterContent,
    generateBookOutline,
    improveContent,
    generateTitle,
} from "../controllers/aiController";
import { protect } from "../middlewares/authMiddleware";

// Apply protect middleware to all routes in this file
router.use(protect);

// AI Routes
router.post("/generate-chapter", generateChapterContent);
router.post("/generate-outline", generateBookOutline);
router.post("/improve-content", improveContent);
router.post("/generate-title", generateTitle);

export default router;
