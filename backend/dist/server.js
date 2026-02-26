"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const bookRoutes_1 = __importDefault(require("./routes/bookRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const exportRoutes_1 = __importDefault(require("./routes/exportRoutes"));
// Express Instance
const app = (0, express_1.default)();
// MIddleware to handle CORS
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Connect DB
(0, db_1.default)();
// Middleware to Parse JSON
app.use(express_1.default.json());
// Static folder for "uploads" directory
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/books", bookRoutes_1.default);
app.use("/api/ai", aiRoutes_1.default);
app.use("/api/export", exportRoutes_1.default);
// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
