import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles, Download, Zap, Loader2 } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";
import type { Book } from "../types/book";
import { PublicBookCard } from "../components/cards/PublicBookCard";

const LandingPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.BOOKS.GET_PUBLIC);
        setBooks(response.data);
      } catch (error) {
        console.error("Failed to fetch public books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Floating Rounded Navbar */}
      <div className="pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">eBook Creator</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors px-3 py-2">
              <span data-testid="landing-nav-login">Login</span>
            </Link>
            <Link to="/signup" data-testid="landing-nav-signup" className="text-sm font-medium text-white bg-primary hover:bg-orange-600 px-5 py-2 rounded-full transition-colors shadow-sm">
              Sign Up
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <BookOpen className="h-20 w-20 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Beautiful eBooks
            <span className="block text-primary mt-2">With AI Power</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Write, organize, and export your books with ease. Powered by AI to help you create amazing content faster than ever.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup"
              data-testid="landing-hero-signup"
              className="px-8 py-4 bg-primary hover:bg-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              data-testid="landing-hero-login"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need to Create Amazing Books
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI-Powered Writing
            </h3>
            <p className="text-gray-600">
              Generate chapters, improve content, and get creative suggestions with our advanced AI assistant.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Easy Organization
            </h3>
            <p className="text-gray-600">
              Organize your book into chapters, add descriptions, and manage your content effortlessly.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Multiple Export Formats
            </h3>
            <p className="text-gray-600">
              Export your finished book as PDF, DOCX, or Markdown with beautiful formatting.
            </p>
          </div>
        </div>
      </div>

      {/* Public Books Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Discover Amazing Books
              </h2>
              <p className="text-gray-600">
                Read public books created by our community members.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : books.length > 0 ? (
            // 1 mobile, 2 tablet (sm), 3 desktop (lg)
            <div data-testid="public-books-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <PublicBookCard key={book._id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No books found</h3>
              <p className="text-gray-500">Check back later for new stories.</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Zap className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Writing?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of authors creating amazing content with our platform.
          </p>
          <Link
            to="/signup"
            data-testid="landing-cta-signup"
            className="inline-block px-8 py-4 bg-primary hover:bg-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Create Your First Book
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <footer className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-gray-100 px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">eBook Creator</span>
          </div>

          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} eBook Creator. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
