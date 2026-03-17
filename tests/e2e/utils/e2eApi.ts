import fs from "fs";
import os from "os";
import path from "path";
import type { Browser, BrowserContext, Page } from "@playwright/test";

const backendUrl = process.env.E2E_BACKEND_URL || "http://127.0.0.1:8000";
const frontendUrl = process.env.E2E_FRONTEND_URL || "http://127.0.0.1:5173";

type SeedChapter = {
  title: string;
  description?: string;
  content?: string;
};

type SeedBook = {
  title: string;
  subtitle?: string;
  author?: string;
  coverImage?: string;
  status?: "draft" | "published";
  chapters?: SeedChapter[];
};

type SeedUser = {
  name?: string;
  email?: string;
  password?: string;
  avatar?: string;
  isPro?: boolean;
};

export type SeedSession = {
  token: string;
  password: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    isPro?: boolean;
    createdAt?: string;
  };
  books: Array<{
    _id: string;
    title: string;
    subtitle?: string;
    author: string;
    coverImage?: string;
    status?: string;
    chapters: SeedChapter[];
  }>;
};

export const uniqueId = (prefix = "e2e"): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const uniqueEmail = (prefix = "e2e"): string =>
  `${uniqueId(prefix)}@example.com`;

const requestJson = async <T>(
  endpoint: string,
  init?: RequestInit
): Promise<T> => {
  const response = await fetch(`${backendUrl}${endpoint}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed (${response.status}) ${endpoint}: ${body}`);
  }

  return (await response.json()) as T;
};

export const resetE2EState = async (): Promise<void> => {
  await requestJson<{ success: boolean }>("/api/test/reset", {
    method: "POST",
  });
};

export const seedSession = async (options?: {
  user?: SeedUser;
  books?: SeedBook[];
}): Promise<SeedSession> =>
  requestJson<SeedSession>("/api/test/seed", {
    method: "POST",
    body: JSON.stringify(options ?? {}),
  });

export const applyAuthState = async (
  page: Page,
  session: SeedSession
): Promise<void> => {
  await page.goto(frontendUrl);
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    { token: session.token, user: session.user }
  );
};

export const createAuthStorageState = async (
  browser: Browser,
  session: SeedSession
): Promise<string> => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await applyAuthState(page, session);

  const storageDir = path.join(os.tmpdir(), "ebook-playwright-auth");
  fs.mkdirSync(storageDir, { recursive: true });
  const storagePath = path.join(storageDir, `${uniqueId("storage")}.json`);

  await context.storageState({ path: storagePath });
  await context.close();
  return storagePath;
};

export const createAuthenticatedPage = async (
  browser: Browser,
  options?: {
    user?: SeedUser;
    books?: SeedBook[];
  }
): Promise<{
  context: BrowserContext;
  page: Page;
  session: SeedSession;
}> => {
  const session = await seedSession(options);
  const storageState = await createAuthStorageState(browser, session);
  const context = await browser.newContext({
    baseURL: frontendUrl,
    storageState,
  });
  const page = await context.newPage();
  return { context, page, session };
};
