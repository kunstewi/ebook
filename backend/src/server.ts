import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import connectDB from "./config/db";

// Connect DB
connectDB();

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
