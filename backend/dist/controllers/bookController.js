"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookCover = exports.deleteBook = exports.updateBook = exports.getBookById = exports.getBooks = exports.createBook = void 0;
const Book_1 = __importDefault(require("../models/Book"));
// @desc      Create a new book
// @route     POST /api/books
// @access    Private
const createBook = async (req, res) => {
    try {
        const { title, author, subtitle, chapters } = req.body;
        if (!title || !author) {
            return res
                .status(400)
                .json({ message: "Please provide a title and author" });
        }
        const book = await Book_1.default.create({
            userId: req.user?._id,
            title,
            author,
            subtitle,
            chapters,
        });
        res.status(201).json(book);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.createBook = createBook;
// @desc    Get all books for a user
// @route   GET /api/books
// @access  Private
const getBooks = async (req, res) => {
    try {
        const books = await Book_1.default.find({ userId: req.user?._id }).sort({
            createdAt: -1,
        });
        res.status(200).json(books);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getBooks = getBooks;
// @desc    Get a single book by ID
// @route   GET /api/books/:id
// @access  Private
const getBookById = async (req, res) => {
    try {
        const book = await Book_1.default.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        if (book.userId.toString() !== req.user?._id?.toString()) {
            return res
                .status(401)
                .json({ message: "Not authorized to view this book" });
        }
        res.status(200).json(book);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getBookById = getBookById;
// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req, res) => {
    try {
        const book = await Book_1.default.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        if (book.userId.toString() !== req.user?._id?.toString()) {
            return res
                .status(401)
                .json({ message: "Not authorized to update this book" });
        }
        const updatedBook = await Book_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        res.status(200).json(updatedBook);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateBook = updateBook;
// above apis are working correctly, these below ones aren't
// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req, res) => {
    try {
        const book = await Book_1.default.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        if (book.userId.toString() !== req.user?._id?.toString()) {
            return res
                .status(401)
                .json({ message: "Not authorized to delete this book" });
        }
        await book.deleteOne();
        res.status(200).json({ message: "Book deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteBook = deleteBook;
// this api is not working properly the coverImage isn't getting uploaded to database
// @desc    Update a book's cover image
// @route   PUT /api/books/cover/:id
// @access  Private
const updateBookCover = async (req, res) => {
    try {
        const book = await Book_1.default.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        if (book.userId.toString() !== req.user?._id?.toString()) {
            return res
                .status(401)
                .json({ message: "Not authorized to update this book" });
        }
        if (req.file) {
            book.coverImage = `/uploads/${req.file.filename}`;
        }
        else {
            return res.status(400).json({ message: "No image file provided" });
        }
        const updatedBook = await book.save();
        res.status(200).json(updatedBook);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateBookCover = updateBookCover;
// Export handled by inline export const
