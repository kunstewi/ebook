import express, { Application } from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import aiRoutes from "./routes/aiRoutes";
import exportRoutes from "./routes/exportRoutes";

// Express Instance
const app: Application = express();

// Middleware to handle CORS
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Middleware to Parse JSON
app.use(express.json());

// Static folder for "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/export", exportRoutes);

export default app;
