export interface Book {
    _id: string;
    title: string;
    subtitle?: string;
    author: string;
    coverImage?: string;
    status?: string;
    chapters?: unknown[];
}
