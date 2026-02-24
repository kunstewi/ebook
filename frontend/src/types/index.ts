// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    isPro?: boolean;
    createdAt?: string;
}

// ─── Book ────────────────────────────────────────────────────────────────────

export interface Chapter {
    title: string;
    description: string;
    content: string;
}

export interface Book {
    _id: string;
    title: string;
    subtitle?: string;
    author: string;
    coverImage?: string;
    status?: "draft" | "published";
    chapters: Chapter[];
}

// ─── Auth ────────────────────────────────────────────────────────────────────

/** Discriminated union — callers can narrow with `if (result.success)` */
export type AuthResult =
    | { success: true }
    | { success: false; error: string };

export interface AuthContextValue {
    user: User | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    register: (name: string, email: string, password: string) => Promise<AuthResult>;
    login: (email: string, password: string) => Promise<AuthResult>;
    logout: () => void;
    fetchProfile: (authToken?: string) => Promise<User | null>;
    updateProfile: (updates: Partial<Pick<User, "name" | "avatar">> & { password?: string }) => Promise<AuthResult & { user?: User }>;
}
