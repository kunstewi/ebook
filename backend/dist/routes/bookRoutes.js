"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const bookController_1 = require("../controllers/bookController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const uploadMiddleware_1 = __importDefault(require("../middlewares/uploadMiddleware"));
// Apply protect middleware to all routes in this file
router.use(authMiddleware_1.protect);
router.route("/").post(bookController_1.createBook).get(bookController_1.getBooks);
router.route("/:id").get(bookController_1.getBookById).put(bookController_1.updateBook).delete(bookController_1.deleteBook);
router.route("/cover/:id").put(uploadMiddleware_1.default, bookController_1.updateBookCover);
exports.default = router;
