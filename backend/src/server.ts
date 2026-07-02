import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db";
import authRoutes from "./routes/authRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import path from "path";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Upload route
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Nestor API is running ✅" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
