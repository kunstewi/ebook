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
    status?: string;
    chapters: Chapter[];
}
