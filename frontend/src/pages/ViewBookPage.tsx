import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";
import toast from "react-hot-toast";
import MDEditor from "@uiw/react-md-editor";
import type { Book, BookParams } from "../types/book";

const ViewBookPage = () => {
  const { bookId } = useParams<BookParams>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  const fetchBook = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.BOOKS.GET_BY_ID(bookId!));
      setBook(response.data);
    } catch (error) {
      toast.error("Failed to fetch book");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const handleNextChapter = () => {
    if (!book) return;
    if (currentChapterIndex < book.chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!book) return null;

  if (!book || !book.chapters || book.chapters.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No content yet</h2>
          <p className="text-gray-600 mb-6">This book doesn't have any chapters yet.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-primary hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentChapter = book.chapters[currentChapterIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>

          {/* Book Cover and Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-start space-x-6">
              {book.coverImage ? (
                <img
                  src={`http://localhost:8000${book.coverImage}`}
                  alt={book.title}
                  className="w-32 md:w-40 aspect-[3/4] object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-32 md:w-40 aspect-[3/4] bg-gradient-to-br from-primary/20 to-orange-200 rounded-lg shadow-md flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary/40" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="text-lg text-gray-600 mb-2">{book.subtitle}</p>
                )}
                <p className="text-gray-700 mb-4">by {book.author}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{book.chapters.length} chapters</span>
                  <span className={`px-3 py-1 rounded-full ${book.status === "published"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                    }`}>
                    {book.status || "draft"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter Navigation */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousChapter}
                disabled={currentChapterIndex === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Chapter {currentChapterIndex + 1} of {book.chapters.length}
                </p>
                <p className="font-semibold text-gray-900">
                  {currentChapter.title}
                </p>
              </div>

              <button
                onClick={handleNextChapter}
                disabled={currentChapterIndex === book.chapters.length - 1}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Chapter Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {currentChapter.title}
          </h2>
          {currentChapter.description && (
            <p className="text-lg text-gray-600 italic mb-6">
              {currentChapter.description}
            </p>
          )}
          <div className="prose prose-lg max-w-none">
            {currentChapter.content ? (
              <div data-color-mode="light">
                <MDEditor.Markdown source={currentChapter.content} />
              </div>
            ) : (
              <p className="text-gray-500 italic">No content available for this chapter.</p>
            )}
          </div>
        </div>

        {/* Chapter List */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Chapters</h3>
          <div className="space-y-2">
            {book.chapters.map((chapter, index) => (
              <button
                key={index}
                onClick={() => setCurrentChapterIndex(index)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${currentChapterIndex === index
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  }`}
              >
                <p className="font-medium text-gray-900">
                  Chapter {index + 1}: {chapter.title}
                </p>
                {chapter.description && (
                  <p className="text-sm text-gray-600 mt-1">{chapter.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBookPage;
