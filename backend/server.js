require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Express Instance
const app = express();

// MIddleware to handle CORS
app.use(
  cors({
    origin: "*",
    method: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to Parse JSON
app.use(express.json());

// Static folder for uploads
app.use("backend/uploads", express.static(path.join(__dirname, "uploads")));

// Connect DB
connectDB();

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
