const express = require("express");
const router = express.Router();
const {
    exportToPDF,
    exportToDocx,
    exportToMarkdown,
} = require("../controllers/exportController");
const { protect } = require("../middlewares/authMiddleware");

// Apply protect middleware to all routes in this file
router.use(protect);

// Export Routes
router.get("/pdf/:id", exportToPDF);
router.get("/docx/:id", exportToDocx);
router.get("/markdown/:id", exportToMarkdown);

module.exports = router;
