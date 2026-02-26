"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const exportController_1 = require("../controllers/exportController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
// Apply protect middleware to all routes in this file
router.use(authMiddleware_1.protect);
// Export Routes
router.get("/pdf/:id", exportController_1.exportToPDF);
router.get("/docx/:id", exportController_1.exportToDocx);
router.get("/markdown/:id", exportController_1.exportToMarkdown);
exports.default = router;
