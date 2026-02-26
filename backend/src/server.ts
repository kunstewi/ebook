import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/db";

import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import aiRoutes from "./routes/aiRoutes";
import exportRoutes from "./routes/exportRoutes";

// Express Instance
const app: Application = express();

// MIddleware to handle CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect DB
connectDB();

// Middleware to Parse JSON
app.use(express.json());

// Static folder for "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/export", exportRoutes);

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
