# eBook Backend API Documentation

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
