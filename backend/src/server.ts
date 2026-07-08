import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db";
import passport from "./config/passport";
import authRoutes from "./routes/authRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import path from "path";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

// Ensure database constraints exist to prevent duplicate accounts
async function ensureConstraints() {
  try {
    // Add UNIQUE constraint on email if not exists
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique') THEN
          ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Constraint users_email_unique already exists or other error';
      END $$;
    `);

    // Add UNIQUE constraint on google_id if not exists
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_google_id_unique') THEN
          ALTER TABLE users ADD CONSTRAINT users_google_id_unique UNIQUE (google_id);
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Constraint users_google_id_unique already exists or other error';
      END $$;
    `);

    console.log("✅ Database constraints verified");
  } catch (err) {
    console.error("Failed to add constraints:", err);
  }
}

void ensureConstraints();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://nestor-two.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/admin", adminRoutes);

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Upload route
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Nestor API is running ✅" });
});

// Ticket route
app.use("/api/tickets", ticketRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
