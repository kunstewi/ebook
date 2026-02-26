import express from "express";
const router = express.Router();
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  updateBookCover,
  getPublicBooks,
} from "../controllers/bookController";
import { protect } from "../middlewares/authMiddleware";
import upload from "../middlewares/uploadMiddleware";

// Public routes
router.route("/public").get(getPublicBooks);

// Apply protect middleware to all routes in this file
router.use(protect);

router.route("/").post(createBook).get(getBooks);
router.route("/:id").get(getBookById).put(updateBook).delete(deleteBook);
router.route("/cover/:id").put(upload, updateBookCover);

export default router;
