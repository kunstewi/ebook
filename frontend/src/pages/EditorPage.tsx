import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Save,
  Download,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
  Trash2,
  GripVertical,
  Globe,
  Lock,
} from "lucide-react";
import type { AxiosError } from "axios";
import Navbar from "../components/layout/Navbar";
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";
import toast from "react-hot-toast";
import MDEditor from "@uiw/react-md-editor";
import type { Book, Chapter, BookParams } from "../types/book";
import { toBackendAssetUrl } from "../utils/runtimeConfig";

const EditorPage = () => {
  const { bookId } = useParams<BookParams>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  const fetchBook = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.BOOKS.GET_BY_ID(bookId!));
      setBook(response.data);
      if (!response.data.chapters || response.data.chapters.length === 0) {
        setBook({
          ...response.data,
          chapters: [{ title: "Chapter 1", description: "", content: "" }],
        });
      }
    } catch (error) {
      toast.error("Failed to fetch book");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put(API_PATHS.BOOKS.UPDATE(bookId!), book);
      toast.success("Book saved successfully!");
    } catch (error) {
      toast.error("Failed to save book");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!book) return;
    setSaving(true);
    const newStatus = book.status === "published" ? "draft" : "published";
    try {
      const updatedBook = { ...book, status: newStatus };
      const response = await axiosInstance.put(API_PATHS.BOOKS.UPDATE(bookId!), updatedBook);
      setBook(response.data);
      toast.success(newStatus === "published" ? "Book published successfully!" : "Book unpublished and moved to drafts.");
    } catch (error) {
      toast.error(`Failed to ${newStatus === "published" ? "publish" : "unpublish"} book`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddChapter = () => {
    if (!book) return;
    const newChapter = {
      title: `Chapter ${book.chapters.length + 1}`,
      description: "",
      content: "",
    };
    setBook({
      ...book,
      chapters: [...book.chapters, newChapter],
    });
    setActiveChapterIndex(book.chapters.length);
  };

  const handleDeleteChapter = (index: number) => {
    if (!book) return;
    if (book.chapters.length === 1) {
      toast.error("Cannot delete the last chapter");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this chapter?")) {
      return;
    }
    const newChapters = book.chapters.filter((_, i) => i !== index);
    setBook({ ...book, chapters: newChapters });
    if (activeChapterIndex >= newChapters.length) {
      setActiveChapterIndex(newChapters.length - 1);
    }
  };

  const handleChapterChange = (field: keyof Chapter, value: string) => {
    if (!book) return;
    const newChapters = [...book.chapters];
    newChapters[activeChapterIndex] = {
      ...newChapters[activeChapterIndex],
      [field]: value,
    };
    setBook({ ...book, chapters: newChapters });
  };

  const handleGenerateChapterContent = async () => {
    if (!book) return;
    const currentChapter = book.chapters[activeChapterIndex];
    if (!currentChapter.title) {
      toast.error("Please add a chapter title first");
      return;
    }

    setAiLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_CHAPTER, {
        title: currentChapter.title,
        description: currentChapter.description,
        bookContext: `${book.title} by ${book.author}`,
      });

      handleChapterChange("content", response.data.content);
      toast.success("Content generated successfully!");
      setShowAIModal(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to generate content");
    } finally {
      setAiLoading(false);
    }
  };

  const handleImproveContent = async (improvementType: "grammar" | "clarity" | "expand") => {
    if (!book) return;
    const currentChapter = book.chapters[activeChapterIndex];
    if (!currentChapter.content) {
      toast.error("No content to improve");
      return;
    }

    setAiLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AI.IMPROVE_CONTENT, {
        content: currentChapter.content,
        improvementType,
      });

      handleChapterChange("content", response.data.improvedContent);
      toast.success("Content improved successfully!");
      setShowAIModal(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to improve content");
    } finally {
      setAiLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "docx" | "markdown") => {
    try {
      const endpoint =
        format === "pdf"
          ? API_PATHS.EXPORT.PDF(bookId!)
          : format === "docx"
            ? API_PATHS.EXPORT.DOCX(bookId!)
            : API_PATHS.EXPORT.MARKDOWN(bookId!);

      const response = await axiosInstance.get(endpoint, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${book!.title.replace(/[^a-z0-9]/gi, "_")}.${format === "markdown" ? "md" : format}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Book exported as ${format.toUpperCase()}!`);
      setShowExportModal(false);
    } catch (error) {
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      const response = await axiosInstance.put(
        API_PATHS.BOOKS.UPDATE_COVER(bookId!),
        formData
      );
      setBook((prev) => prev ? { ...prev, coverImage: response.data.coverImage } : response.data);
      toast.success("Cover image updated!");
    } catch (error) {
      toast.error("Failed to upload cover image");
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

  const currentChapter = book.chapters[activeChapterIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
                <p className="text-sm text-gray-600">by {book.author}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAIModal(true)}
                data-testid="editor-ai-button"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Assistant</span>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                data-testid="editor-export-button"
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={handleTogglePublish}
                data-testid="editor-publish-button"
                disabled={saving}
                className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${book.status === "published"
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                {book.status === "published" ? (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Unpublish</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    <span>Publish</span>
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                data-testid="editor-save-button"
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "Saving..." : "Save"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Chapters List */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Chapters</h2>
                <button
                  onClick={handleAddChapter}
                  data-testid="editor-add-chapter-button"
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Plus className="h-5 w-5 text-primary" />
                </button>
              </div>
              <div className="space-y-2">
                {book.chapters.map((chapter, index) => (
                  <div
                    key={index}
                    data-testid={`editor-chapter-item-${index}`}
                    onClick={() => setActiveChapterIndex(index)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${activeChapterIndex === index
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {chapter.title || `Chapter ${index + 1}`}
                        </p>
                        {chapter.description && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {chapter.description}
                          </p>
                        )}
                      </div>
                      {book.chapters.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChapter(index);
                          }}
                          data-testid={`editor-delete-chapter-${index}`}
                          className="ml-2 p-1 hover:bg-red-100 rounded text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cover Image Upload */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Book Cover
                </h3>
                <div className="relative aspect-[3/4] w-full">
                  {book.coverImage ? (
                    <img
                      src={toBackendAssetUrl(book.coverImage)}
                      alt="Book cover"
                      data-testid="editor-cover-image"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <label className="absolute bottom-2 right-2 px-3 py-1 bg-white hover:bg-gray-50 rounded-lg shadow-md cursor-pointer text-sm font-medium text-gray-700 transition-colors">
                    Upload
                    <input
                      type="file"
                      data-testid="editor-cover-input"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Title
                </label>
                <input
                  type="text"
                  data-testid="editor-chapter-title-input"
                  value={currentChapter.title}
                  onChange={(e) => handleChapterChange("title", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter chapter title"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Description
                </label>
                <textarea
                  data-testid="editor-chapter-description-input"
                  value={currentChapter.description}
                  onChange={(e) =>
                    handleChapterChange("description", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                  placeholder="Brief description of this chapter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Content
                </label>
                <div data-color-mode="light" data-testid="chapter-content-editor">
                  <MDEditor
                    value={currentChapter.content}
                    onChange={(value) => handleChapterChange("content", value || "")}
                    height={500}
                    preview="edit"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Sparkles className="h-6 w-6 text-purple-600 mr-2" />
              AI Assistant
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleGenerateChapterContent}
                data-testid="ai-generate-content-button"
                disabled={aiLoading}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 text-left"
              >
                Generate Chapter Content
              </button>
              <button
                onClick={() => handleImproveContent("grammar")}
                data-testid="ai-improve-grammar-button"
                disabled={aiLoading}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 text-left"
              >
                Improve Grammar
              </button>
              <button
                onClick={() => handleImproveContent("clarity")}
                data-testid="ai-improve-clarity-button"
                disabled={aiLoading}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 text-left"
              >
                Improve Clarity
              </button>
              <button
                onClick={() => handleImproveContent("expand")}
                data-testid="ai-expand-content-button"
                disabled={aiLoading}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 text-left"
              >
                Expand Content
              </button>
              <button
                onClick={() => setShowAIModal(false)}
                data-testid="ai-cancel-button"
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
            {aiLoading && (
              <div className="mt-4 text-center text-sm text-gray-600">
                AI is working on your request...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Download className="h-6 w-6 text-green-600 mr-2" />
              Export Book
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => handleExport("pdf")}
                data-testid="export-pdf-button"
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-left"
              >
                Export as PDF
              </button>
              <button
                onClick={() => handleExport("docx")}
                data-testid="export-docx-button"
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-left"
              >
                Export as DOCX
              </button>
              <button
                onClick={() => handleExport("markdown")}
                data-testid="export-markdown-button"
                className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors text-left"
              >
                Export as Markdown
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                data-testid="export-cancel-button"
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPage;
