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
        GET_BY_ID: (id) => `/books/${id}`,
        UPDATE: (id) => `/books/${id}`,
        DELETE: (id) => `/books/${id}`,
        UPDATE_COVER: (id) => `/books/cover/${id}`,
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
        PDF: (id) => `/export/pdf/${id}`,
        DOCX: (id) => `/export/docx/${id}`,
        MARKDOWN: (id) => `/export/markdown/${id}`,
    },
};

export default API_PATHS;
