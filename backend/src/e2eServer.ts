import dotenv from "dotenv";
import cors from "cors";
import express, { NextFunction, Request, RequestHandler, Response } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";

dotenv.config();

process.env.NODE_ENV = "e2e";
process.env.PORT = process.env.PORT || "8000";
process.env.JWT_SECRET = process.env.JWT_SECRET || "e2e-jwt-secret";
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "e2e-gemini-key";

type E2EUser = {
  _id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  isPro: boolean;
  createdAt: string;
  updatedAt: string;
};

type E2EChapter = {
  title: string;
  description: string;
  content: string;
};

type E2EBook = {
  _id: string;
  userId: string;
  title: string;
  subtitle: string;
  author: string;
  coverImage: string;
  status: "draft" | "published";
  chapters: E2EChapter[];
  createdAt: string;
  updatedAt: string;
};

const app = express();
const uploadsDir = path.join(process.cwd(), "uploads");

const state: {
  users: E2EUser[];
  books: E2EBook[];
} = {
  users: [],
  books: [],
};

const ensureUploadsDir = (): void => {
  fs.mkdirSync(uploadsDir, { recursive: true });
};

const clearUploadsDir = (): void => {
  ensureUploadsDir();

  for (const entry of fs.readdirSync(uploadsDir)) {
    fs.rmSync(path.join(uploadsDir, entry), { force: true, recursive: true });
  }
};

const resetState = (): void => {
  state.users = [];
  state.books = [];
  clearUploadsDir();
};

const createToken = (userId: string): string =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });

const serializeUser = (user: E2EUser) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  isPro: user.isPro,
  createdAt: user.createdAt,
});

const toBookResponse = (book: E2EBook) => ({
  _id: book._id,
  userId: book.userId,
  title: book.title,
  subtitle: book.subtitle,
  author: book.author,
  coverImage: book.coverImage,
  status: book.status,
  chapters: book.chapters,
  createdAt: book.createdAt,
  updatedAt: book.updatedAt,
});

const getRequestUser = (req: Request): E2EUser | undefined =>
  (req as any).user as E2EUser | undefined;

const requireAuth: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const user = state.users.find((candidate) => candidate._id === decoded.id);

    if (!user) {
      res.status(401).json({ message: "Not authorized, token failed" });
      return;
    }

    (req as any).user = user;
    next();
  } catch (_error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
      return;
    }

    cb(new Error("Error: Images Only!"));
  },
}).single("coverImage");

const createUser = (overrides?: Partial<E2EUser> & { password?: string }): E2EUser => {
  const now = new Date().toISOString();
  const email =
    overrides?.email || `e2e-${Date.now()}-${randomUUID()}@example.com`;

  return {
    _id: overrides?._id || randomUUID(),
    name: overrides?.name || "E2E Test User",
    email,
    password: overrides?.password || "Password123!",
    avatar: overrides?.avatar || "",
    isPro: overrides?.isPro ?? false,
    createdAt: overrides?.createdAt || now,
    updatedAt: overrides?.updatedAt || now,
  };
};

const createBook = (
  userId: string,
  overrides: Partial<E2EBook> & { title: string }
): E2EBook => {
  const now = new Date().toISOString();

  return {
    _id: overrides._id || randomUUID(),
    userId,
    title: overrides.title,
    subtitle: overrides.subtitle || "",
    author: overrides.author || "E2E Author",
    coverImage: overrides.coverImage || "",
    status: overrides.status || "draft",
    chapters:
      overrides.chapters?.map((chapter) => ({
        title: chapter.title,
        description: chapter.description || "",
        content: chapter.content || "",
      })) || [],
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
  };
};

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
ensureUploadsDir();
app.use("/uploads", express.static(uploadsDir));

app.get("/api/test/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/api/test/reset", (_req, res) => {
  resetState();
  res.status(200).json({ success: true });
});

app.post("/api/test/seed", (req, res) => {
  const user = createUser(req.body?.user);
  state.users.push(user);

  const books = (req.body?.books || []).map((book: Partial<E2EBook> & { title: string }) => {
    const createdBook = createBook(user._id, {
      ...book,
      author: book.author || user.name,
    });
    state.books.push(createdBook);
    return createdBook;
  });

  res.status(201).json({
    success: true,
    token: createToken(user._id),
    password: user.password,
    user: serializeUser(user),
    books: books.map(toBookResponse),
  });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ message: "Please fill all fields" });
    return;
  }

  if (state.users.some((user) => user.email === email)) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const user = createUser({ name, email, password });
  state.users.push(user);

  res.status(201).json({
    message: "User registered successfully",
    token: createToken(user._id),
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ message: "Please provide email and password" });
    return;
  }

  const user = state.users.find((candidate) => candidate.email === email);

  if (!user || user.password !== password) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  res.status(200).json({
    message: "Login successful",
    token: createToken(user._id),
    user: serializeUser(user),
  });
});

app.get("/api/auth/profile", requireAuth, (req, res) => {
  res.status(200).json(serializeUser(getRequestUser(req)!));
});

app.put("/api/auth/profile", requireAuth, (req, res) => {
  const user = getRequestUser(req)!;
  user.name = req.body.name || user.name;
  user.avatar = req.body.avatar || user.avatar;
  if (req.body.password) {
    user.password = req.body.password;
  }
  user.updatedAt = new Date().toISOString();

  res.status(200).json({
    message: "Profile updated successfully",
    user: serializeUser(user),
  });
});

app.get("/api/books/public", (_req, res) => {
  const books = [...state.books]
    .filter((book) => book.status === "published")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toBookResponse);

  res.status(200).json(books);
});

app.post("/api/books", requireAuth, (req, res) => {
  const { title, author, subtitle } = req.body as {
    title?: string;
    author?: string;
    subtitle?: string;
  };

  if (!title || !author) {
    res.status(400).json({ message: "Please provide a title and author" });
    return;
  }

  const book = createBook(getRequestUser(req)!._id, {
    title,
    author,
    subtitle,
    chapters: req.body.chapters || [],
  });
  state.books.unshift(book);

  res.status(201).json(toBookResponse(book));
});

app.get("/api/books", requireAuth, (req, res) => {
  const books = state.books
    .filter((book) => book.userId === getRequestUser(req)!._id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toBookResponse);

  res.status(200).json(books);
});

app.get("/api/books/:id", requireAuth, (req, res) => {
  const book = state.books.find((candidate) => candidate._id === req.params.id);

  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  if (book.userId !== getRequestUser(req)!._id) {
    res.status(401).json({ message: "Not authorized to view this book" });
    return;
  }

  res.status(200).json(toBookResponse(book));
});

app.put("/api/books/:id", requireAuth, (req, res) => {
  const book = state.books.find((candidate) => candidate._id === req.params.id);

  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  if (book.userId !== getRequestUser(req)!._id) {
    res.status(401).json({ message: "Not authorized to update this book" });
    return;
  }

  Object.assign(book, {
    ...req.body,
    updatedAt: new Date().toISOString(),
  });

  if (req.body.chapters) {
    book.chapters = req.body.chapters.map((chapter: E2EChapter) => ({
      title: chapter.title,
      description: chapter.description || "",
      content: chapter.content || "",
    }));
  }

  res.status(200).json(toBookResponse(book));
});

app.delete("/api/books/:id", requireAuth, (req, res) => {
  const bookIndex = state.books.findIndex(
    (candidate) => candidate._id === req.params.id
  );

  if (bookIndex === -1) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  if (state.books[bookIndex].userId !== getRequestUser(req)!._id) {
    res.status(401).json({ message: "Not authorized to delete this book" });
    return;
  }

  state.books.splice(bookIndex, 1);
  res.status(200).json({ message: "Book deleted successfully" });
});

app.put("/api/books/cover/:id", requireAuth, (req, res) => {
  upload(req, res, (error) => {
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    const book = state.books.find((candidate) => candidate._id === req.params.id);

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    if (book.userId !== getRequestUser(req)!._id) {
      res.status(401).json({ message: "Not authorized to update this book" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }

    const extension = path.extname(req.file.originalname) || ".png";
    const filename = `coverImage-${Date.now()}${extension}`;
    fs.writeFileSync(path.join(uploadsDir, filename), req.file.buffer);

    book.coverImage = `/uploads/${filename}`;
    book.updatedAt = new Date().toISOString();

    res.status(200).json(toBookResponse(book));
  });
});

app.post("/api/ai/generate-chapter", requireAuth, (req, res) => {
  const { title, description, bookContext } = req.body as {
    title?: string;
    description?: string;
    bookContext?: string;
  };

  if (!title) {
    res.status(400).json({ message: "Chapter title is required" });
    return;
  }

  res.status(200).json({
    success: true,
    content: `# ${title}\n\nGenerated for ${bookContext || "your book"}.\n\n${description || "Mock chapter description."}`,
  });
});

app.post("/api/ai/improve-content", requireAuth, (req, res) => {
  const { content, improvementType } = req.body as {
    content?: string;
    improvementType?: string;
  };

  if (!content) {
    res.status(400).json({ message: "Content is required" });
    return;
  }

  res.status(200).json({
    success: true,
    improvedContent: `[${improvementType || "improved"}] ${content}`,
  });
});

app.get("/api/export/pdf/:id", requireAuth, (req, res) => {
  const book = state.books.find((candidate) => candidate._id === req.params.id);

  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  if (book.userId !== getRequestUser(req)!._id) {
    res.status(401).json({ message: "Not authorized to export this book" });
    return;
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${book.title.replace(/[^a-z0-9]/gi, "_")}.pdf"`
  );
  res.send(Buffer.from(`PDF export for ${book.title}`));
});

app.get("/api/export/docx/:id", requireAuth, (req, res) => {
  const book = state.books.find((candidate) => candidate._id === req.params.id);

  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  if (book.userId !== getRequestUser(req)!._id) {
    res.status(401).json({ message: "Not authorized to export this book" });
    return;
  }

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${book.title.replace(/[^a-z0-9]/gi, "_")}.docx"`
  );
  res.send(Buffer.from(`DOCX export for ${book.title}`));
});

app.get("/api/export/markdown/:id", requireAuth, (req, res) => {
  const book = state.books.find((candidate) => candidate._id === req.params.id);

  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  if (book.userId !== getRequestUser(req)!._id) {
    res.status(401).json({ message: "Not authorized to export this book" });
    return;
  }

  res.setHeader("Content-Type", "text/markdown");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${book.title.replace(/[^a-z0-9]/gi, "_")}.md"`
  );
  res.send(`# ${book.title}\n\n${book.chapters.map((chapter) => chapter.content).join("\n\n")}`);
});

app.use((_req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

resetState();

const server = app.listen(Number(process.env.PORT), "127.0.0.1", () => {
  console.log(`E2E server is running on PORT ${process.env.PORT}`);
});

server.ref();
setInterval(() => {}, 1 << 30);
