import type { Request } from "express";
import type { Document, Types } from "mongoose";

// ── Domain interfaces ────────────────────────────────────────────────────────

export interface IChapter {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  content: string;
}

export interface IBook extends Document {
  userId: Types.ObjectId;
  title: string;
  subtitle: string;
  author: string;
  coverImage: string;
  chapters: IChapter[];
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: string;
  isPro: boolean;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// ── Express Request augmentation ─────────────────────────────────────────────
// Adds req.user so every controller can use it without casting

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Re-export a typed request alias for convenience
export type AuthRequest = Request & { user: IUser };
