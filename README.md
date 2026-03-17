## Migration

### Auth Context tsx migration

- Added type ReactNode and all shared domain types from the new types/index.ts.
```tsx
- import React, { createContext, useState, useContext, useEffect } from "react";
+ import React, { createContext, useState, useContext, useEffect, type ReactNode } from "react";
+ import type { User, AuthResult, AuthContextValue } from "../types/index";
```

- Context Creation: Original had no argument at all — now fully typed with a generic and an explicit null default
```tsx
- const AuthContext = createContext();
+ const AuthContext = createContext<AuthContextValue | null>(null);
```

-  useAuth — return type added
```tsx
- export const useAuth = () => {
+ export const useAuth = (): AuthContextValue => {}
```

- AuthProvider - children typed
```tsx
- export const useAuth = () => {
+ export const useAuth = (): AuthContextValue => {}
```

- useState - typed generics
```tsx
- const [user, setUser] = useState(null);
- const [token, setToken] = useState(null);
+ const [user, setUser] = useState<User | null>(null);
+ const [token, setToken] = useState<string | null>(null);
```

- Async Functions - explicit return types

register
before: implicit Promise<any>	after: Promise<AuthResult>

login
before: implicit Promise<any>	after: Promise<AuthResult>

logout
before: implicit void	after: explicit ():void

fetchProfile
before: implicit Promise<any>	after: Promise<User | null>

updateProfile
before: implicit Promise<any>	after: Promise<AuthResult & { user?: User }>


- Error handling — typed + ?? instead of ||
```tsx
- } catch (error) {
-   const message = error.response?.data?.message || "...";
+ } catch (error: unknown) {
+   const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? "...";
```

- value object — explicitly typed
```tsx
- const value = { user, token, loading, ... };
+ const value: AuthContextValue = { user, token, loading, ... };
```

### EditorPage.tsx migration

- Imports - dded AxiosError, Book, Chapter type imports.
- useParams - useParams<{ bookId: string }>() — eliminates undefined from type.
- useState(null) - → useState<Book | null>(null)
- handleAddChapter - Added if (!book) return guard
- handleDeleteChapter(index) - Typed number, added if (!book) return
- handleChapterChange(field, value) - yped keyof Chapter, string, added if (!book) return
- handleGenerateChapterContent - Added if (!book) return
- handleImproveContent - Added if (!book) return, typed param as union literal
- handleExport(format) - yped param as "pdf" | "docx" | "markdown"
- handleCoverUpload(e) - React.ChangeEvent<HTMLInputElement>, files?.[0] optional chain
- ll API_PATHS calls - bookId! non-null assertion (safe — route always provides it)
- Two catch blocks - Cast to AxiosError<{ message: string }>
- if (!book) return null - Null guard before JSX accesses book
- <textarea rows> - "2" → {2}

### ViewBookPage.tsx migration
- Book type import
- useParams typed
```tsx
// Before   
const { bookId } = useParams();           // bookId: string | undefined

// After
const { bookId } = useParams<{ bookId: string }>();  // bookId: string
```
- useState(null) → useState<Book | null>(null) TypeScript infers null as the null type with no Book shape — this gives it the full type.
- bookId! non-null assertion on the API call
```tsx
API_PATHS.BOOKS.GET_BY_ID(bookId!)
```
- Null guard in handleNextChapter + before JSX
```tsx
// handleNextChapter
if (!book) return;

// before JSX
if (!book) return null;
```

---

## Backend API Documentation


## Base URL
```
http://localhost:8000
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here"
}
```

### Login User
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Get Profile
**GET** `/api/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "",
  "isPro": false
}
```

### Update Profile
**PUT** `/api/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "John Updated",
  "avatar": "https://example.com/avatar.jpg",
  "password": "newpassword123"
}
```

---

## Book Endpoints

### Create Book
**POST** `/api/books`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "My First Book",
  "author": "John Doe",
  "subtitle": "A Journey Begins",
  "chapters": [
    {
      "title": "Chapter 1",
      "description": "Introduction",
      "content": "This is the first chapter..."
    }
  ]
}
```

### Get All Books
**GET** `/api/books`

**Headers:** `Authorization: Bearer <token>`

**Response:** Array of books

### Get Book by ID
**GET** `/api/books/:id`

**Headers:** `Authorization: Bearer <token>`

### Update Book
**PUT** `/api/books/:id`

**Headers:** `Authorization: Bearer <token>`

**Body:** Same as Create Book

### Delete Book
**DELETE** `/api/books/:id`

**Headers:** `Authorization: Bearer <token>`

### Update Book Cover
**PUT** `/api/books/cover/:id`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body:** Form data with `coverImage` file field

---

## AI Endpoints

### Generate Chapter Content
**POST** `/api/ai/generate-chapter`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "Introduction to AI",
  "description": "Basic concepts of artificial intelligence",
  "bookContext": "A beginner's guide to AI"
}
```

**Response:**
```json
{
  "success": true,
  "content": "Generated chapter content..."
}
```

### Generate Book Outline
**POST** `/api/ai/generate-outline`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "topic": "Machine Learning Basics",
  "genre": "Educational",
  "targetAudience": "Beginners",
  "numberOfChapters": 10
}
```

**Response:**
```json
{
  "success": true,
  "outline": {
    "title": "Generated Book Title",
    "subtitle": "Generated Subtitle",
    "chapters": [
      {
        "title": "Chapter Title",
        "description": "Chapter description"
      }
    ]
  }
}
```

### Improve Content
**POST** `/api/ai/improve-content`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "content": "Your existing content here...",
  "improvementType": "grammar"
}
```

**Improvement Types:**
- `grammar` - Fix grammar and spelling
- `clarity` - Improve clarity and readability
- `expand` - Expand with more details
- `simplify` - Simplify the text
- (default) - General improvement

**Response:**
```json
{
  "success": true,
  "improvedContent": "Improved content..."
}
```

### Generate Title
**POST** `/api/ai/generate-title`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "topic": "Web Development",
  "genre": "Technical",
  "keywords": "React, Node.js, Full-stack"
}
```

**Response:**
```json
{
  "success": true,
  "titles": [
    {
      "title": "Main Title",
      "subtitle": "Subtitle"
    }
  ]
}
```

---

## Export Endpoints

### Export to PDF
**GET** `/api/export/pdf/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** PDF file download

### Export to DOCX
**GET** `/api/export/docx/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** DOCX file download

### Export to Markdown
**GET** `/api/export/markdown/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** Markdown file download

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**
```json
{
  "message": "Error description"
}
```

**401 Unauthorized**
```json
{
  "message": "Not authorized, no token"
}
```

**404 Not Found**
```json
{
  "message": "Resource not found"
}
```

**500 Server Error**
```json
{
  "message": "Server error"
}
```

---

## Notes

1. **AI Features**: Require `GEMINI_API_KEY` to be set in environment variables
2. **File Uploads**: Book cover images are limited to 2MB and must be JPEG, JPG, PNG, or GIF
3. **Authentication**: JWT tokens expire after 7 days
4. **Export**: All export endpoints require the book to belong to the authenticated user

---

## E2E Testing Status

**Last Updated:** 2026-03-17  
**Runner:** Playwright  
**Workspace:** [`/Users/kanai/Projects/ebook/tests`](/Users/kanai/Projects/ebook/tests)

### Current Status

- The Playwright suite is now implemented and runnable end to end.
- Current result: `19/19` tests passing.
- Chromium runs the full suite.
- Firefox and WebKit run smoke coverage for public routing and authentication flows.

### What Is Covered

| Area | Coverage |
|------|----------|
| Public routes | Landing page render, CTA navigation, protected-route redirect, published public books |
| Authentication | Signup, login, invalid login, signup validation, logout |
| Dashboard | Empty state, create-book validation, create book, list book, view/edit navigation, cancel delete, confirm delete |
| Editor | Default chapter bootstrap, save persistence, add/delete chapter, publish toggle, AI actions |
| Uploads & exports | Cover upload, PDF export, DOCX export, Markdown export |
| Reader | No-content state, chapter navigation, chapter selection |
| Profile | Edit profile, password confirmation validation, password-change relogin flow |

### Test Architecture

- The frontend uses an env-driven API base URL via `VITE_API_BASE_URL`.
- The Playwright config starts:
  - a dedicated in-memory e2e backend on port `8000`
  - the Vite frontend on port `5173`
- E2E-only seed/reset endpoints provide deterministic test setup and cleanup.
- Stable `data-testid` selectors are added across key auth, dashboard, editor, reader, and profile controls.

### Commands

```bash
# from /Users/kanai/Projects/ebook/tests
npm run test:e2e

# chromium full suite
npm run test:e2e -- --project=chromium

# list discovered tests
npm run test:e2e -- --list
```

### Remaining Work

- Expand Firefox/WebKit beyond smoke coverage if full cross-browser parity is required.
- Add CI wiring if you want this suite enforced on every pull request.
- Replace the e2e mock backend with the real backend stack if you want browser coverage to exercise Mongo-backed persistence in CI.
