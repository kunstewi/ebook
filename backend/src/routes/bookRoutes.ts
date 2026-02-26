import express from "express";
const router = express.Router();
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  updateBookCover,
} from "../controllers/bookController";
import { protect } from "../middlewares/authMiddleware";
import upload from "../middlewares/uploadMiddleware";

// Apply protect middleware to all routes in this file
router.use(protect);

router.route("/").post(createBook).get(getBooks);
router.route("/:id").get(getBookById).put(updateBook).delete(deleteBook);
router.route("/cover/:id").put(upload, updateBookCover);

export default router;
