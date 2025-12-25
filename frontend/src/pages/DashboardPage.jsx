import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, Loader } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import BookCard from "../components/cards/BookCard";
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";
import toast from "react-hot-toast";

const DashboardPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    subtitle: "",
    author: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.BOOKS.GET_ALL);
      setBooks(response.data);
    } catch (error) {
      toast.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();

    if (!newBook.title || !newBook.author) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await axiosInstance.post(API_PATHS.BOOKS.CREATE, newBook);
      toast.success("Book created successfully!");
      setBooks([response.data, ...books]);
      setShowCreateModal(false);
      setNewBook({ title: "", subtitle: "", author: "" });
      navigate(`/editor/${response.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create book");
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.BOOKS.DELETE(bookId));
      toast.success("Book deleted successfully!");
      setBooks(books.filter((book) => book._id !== bookId));
    } catch (error) {
      toast.error("Failed to delete book");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Books</h1>
            <p className="text-gray-600 mt-1">Manage and create your eBooks</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            <span>New Book</span>
          </button>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No books yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first book to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Book</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <BookCard key={book._id} book={book} onDelete={handleDeleteBook} />
            ))}
          </div>
        )}
      </div>

      {/* Create Book Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create New Book
            </h2>
            <form onSubmit={handleCreateBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={newBook.title}
                  onChange={(e) =>
                    setNewBook({ ...newBook, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter book title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={newBook.subtitle}
                  onChange={(e) =>
                    setNewBook({ ...newBook, subtitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter subtitle (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author *
                </label>
                <input
                  type="text"
                  required
                  value={newBook.author}
                  onChange={(e) =>
                    setNewBook({ ...newBook, author: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter author name"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-md transition-colors"
                >
                  Create Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
