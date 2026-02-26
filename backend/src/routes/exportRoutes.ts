import express from "express";
const router = express.Router();
import {
    exportToPDF,
    exportToDocx,
    exportToMarkdown,
} from "../controllers/exportController";
import { protect } from "../middlewares/authMiddleware";

// Apply protect middleware to all routes in this file
router.use(protect);

// Export Routes
router.get("/pdf/:id", exportToPDF);
router.get("/docx/:id", exportToDocx);
router.get("/markdown/:id", exportToMarkdown);

export default router;
