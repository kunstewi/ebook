"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const aiController_1 = require("../controllers/aiController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
// Apply protect middleware to all routes in this file
router.use(authMiddleware_1.protect);
// AI Routes
router.post("/generate-chapter", aiController_1.generateChapterContent);
router.post("/generate-outline", aiController_1.generateBookOutline);
router.post("/improve-content", aiController_1.improveContent);
router.post("/generate-title", aiController_1.generateTitle);
exports.default = router;
