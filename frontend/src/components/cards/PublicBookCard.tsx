import React from "react";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Book } from "../../types/book";
import { cn } from "../../utils/cn";

interface PublicBookCardProps {
    book: Book;
    className?: string;
}

export const PublicBookCard = ({ book, className }: PublicBookCardProps) => {
    const navigate = useNavigate();

    const handleReadClick = () => {
        // Redirect to login if unauthenticated
        const token = localStorage.getItem("token");
        if (!token) {
            if (window.confirm("Please login to read this book. Go to login page?")) {
                navigate("/login");
            }
            return;
        }

        // User is logged in, navigate to view book page
        navigate(`/view-book/${book._id}`);
    };

    return (
        <div
            className={cn(
                "group flex flex-col bg-white rounded-xl overflow-hidden cursor-pointer",
                "border border-gray-100 shadow-sm hover:shadow-md",
                "transition-all duration-200 ease-out hover:-translate-y-1",
                className
            )}
            onClick={handleReadClick}
        >
            {/* Aspect ratio container for book cover */}
            <div className="relative aspect-[3/4] w-full bg-gray-50 overflow-hidden flex items-center justify-center">
                {book.coverImage ? (
                    <img
                        src={`http://localhost:8000${book.coverImage}`}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-orange-100/50">
                        <BookOpen className="h-16 w-16 text-primary/40 mb-2" />
                    </div>
                )}

                {/* Overlay hover effect - "YouTube like" play indicator but for reading */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-medium text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-200">
                        Read Book
                    </div>
                </div>
            </div>

            {/* Book details */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors text-balance">
                    {book.title}
                </h3>

                <p className="text-sm text-gray-500 mb-2 truncate text-pretty">
                    {book.author}
                </p>

                <div className="mt-auto flex items-center justify-between text-xs text-gray-400 font-medium tabular-nums">
                    <span>{book.chapters?.length || 0} chapters</span>
                    {/* We can show a tag or something but keeping it clean like YT cards */}
                    <span className="capitalize">{book.status || "published"}</span>
                </div>
            </div>
        </div>
    );
};
