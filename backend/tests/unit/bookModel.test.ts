/// <reference types="jest" />
import { Types } from "mongoose";
import Book from "../../src/models/Book";

describe("Book model", () => {
  it("requires userId, title, and author", () => {
    const book = new Book({});
    const error = book.validateSync();

    expect(error?.errors.userId).toBeDefined();
    expect(error?.errors.title).toBeDefined();
    expect(error?.errors.author).toBeDefined();
  });

  it("restricts status to the supported enum values", () => {
    const book = new Book({
      userId: new Types.ObjectId(),
      title: "Enum Test",
      author: "Codex",
      status: "archived",
    });
    const error = book.validateSync();

    expect(error?.errors.status).toBeDefined();
  });

  it("requires chapter titles when chapters are present", () => {
    const book = new Book({
      userId: new Types.ObjectId(),
      title: "Chapter Validation",
      author: "Codex",
      chapters: [
        {
          description: "Missing title should fail",
          content: "Body content",
        },
      ],
    });
    const error = book.validateSync();

    expect(error?.errors["chapters.0.title"]).toBeDefined();
  });
});
