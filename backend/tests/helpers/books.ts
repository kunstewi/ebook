import { Types } from "mongoose";
import Book from "../../src/models/Book";

type ChapterInput = {
  title: string;
  description?: string;
  content?: string;
};

type BookOverrides = Partial<{
  userId: Types.ObjectId | string;
  title: string;
  subtitle: string;
  author: string;
  coverImage: string;
  chapters: ChapterInput[];
  status: "draft" | "published";
}>;

export const invalidObjectId = "not-a-valid-object-id";

export const validBookPayload = (overrides: BookOverrides = {}) => ({
  userId: overrides.userId || new Types.ObjectId(),
  title: overrides.title || "A Testable Book",
  subtitle: overrides.subtitle || "Built for coverage",
  author: overrides.author || "Codex",
  coverImage: overrides.coverImage || "",
  status: overrides.status || "draft",
  chapters: overrides.chapters || [
    {
      title: "Chapter 1",
      description: "Opening chapter",
      content: "Once upon a test.",
    },
  ],
});

export const createBook = async (overrides: BookOverrides = {}) =>
  Book.create(validBookPayload(overrides));
