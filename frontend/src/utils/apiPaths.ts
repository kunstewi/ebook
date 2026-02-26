import type { BookId } from "../types/book";

// API endpoint paths
const API_PATHS = {
    // Auth endpoints
    AUTH: {
        REGISTER: "/auth/register",
        LOGIN: "/auth/login",
        PROFILE: "/auth/profile",
        UPDATE_PROFILE: "/auth/profile",
    },

    // Book endpoints
    BOOKS: {
        CREATE: "/books",
        GET_ALL: "/books",
        GET_PUBLIC: "/books/public",
        GET_BY_ID: (id: BookId) => `/books/${id}`,
        UPDATE: (id: BookId) => `/books/${id}`,
        DELETE: (id: BookId) => `/books/${id}`,
        UPDATE_COVER: (id: BookId) => `/books/cover/${id}`,
    },

    // AI endpoints
    AI: {
        GENERATE_CHAPTER: "/ai/generate-chapter",
        GENERATE_OUTLINE: "/ai/generate-outline",
        IMPROVE_CONTENT: "/ai/improve-content",
        GENERATE_TITLE: "/ai/generate-title",
    },

    // Export endpoints
    EXPORT: {
        PDF: (id: BookId) => `/export/pdf/${id}`,
        DOCX: (id: BookId) => `/export/docx/${id}`,
        MARKDOWN: (id: BookId) => `/export/markdown/${id}`,
    },
};

export default API_PATHS;
