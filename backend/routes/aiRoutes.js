const express = require("express");
const router = express.Router();
const {
    generateChapterContent,
    generateBookOutline,
    improveContent,
    generateTitle,
} = require("../controllers/aiController");
const { protect } = require("../middlewares/authMiddleware");

// Apply protect middleware to all routes in this file
router.use(protect);

// AI Routes
router.post("/generate-chapter", generateChapterContent);
router.post("/generate-outline", generateBookOutline);
router.post("/improve-content", improveContent);
router.post("/generate-title", generateTitle);

module.exports = router;
