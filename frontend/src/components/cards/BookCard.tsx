import React from "react";
import { BookOpen, Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Book } from "../../types/book";

interface BookCardProps {
  book: Book;
  onDelete?: (id: string) => void;
}

const BookCard = ({ book, onDelete }: BookCardProps) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/view-book/${book._id}`);
  };

  const handleEdit = () => {
    navigate(`/editor/${book._id}`);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(book._id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Book Cover */}
      <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-orange-200 flex items-center justify-center relative overflow-hidden">
        {book.coverImage ? (
          <img
            src={`http://localhost:8000${book.coverImage}`}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpen className="h-20 w-20 text-primary/40" />
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
          {book.title}
        </h3>
        {book.subtitle && (
          <p className="text-sm text-gray-600 mb-2 truncate">{book.subtitle}</p>
        )}
        <p className="text-sm text-gray-500 mb-3">by {book.author}</p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>{book.chapters?.length || 0} chapters</span>
          <span className={`px-2 py-1 rounded-full ${book.status === "published"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
            }`}>
            {book.status || "draft"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleView}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </button>
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
