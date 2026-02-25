export type BookId = string;
export type BookParams = { bookId: string };

export interface Chapter {
    title: string;
    description: string;
    content: string;
}

export interface Book {
    _id: BookId;
    title: string;
    subtitle?: string;
    author: string;
    coverImage?: string;
    status?: string;
    chapters: Chapter[];
}
