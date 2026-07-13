import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db";
import passport from "./config/passport";
import authRoutes from "./routes/authRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import viewingRequestRoutes from "./routes/viewingRequestRoutes";
import messageRoutes from "./routes/messageRoutes";
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

    // Ensure bio column exists on users table
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT
    `);

    // Create viewing_requests table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS viewing_requests (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        landlord_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        preferred_date DATE NOT NULL,
        preferred_time TIME NOT NULL,
        message TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_viewing_requests_property_id ON viewing_requests(property_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_viewing_requests_user_id ON viewing_requests(user_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_viewing_requests_landlord_id ON viewing_requests(landlord_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_viewing_requests_status ON viewing_requests(status)
    `);

    // Create conversations table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user1_id, user2_id)
      )
    `);

    // Create messages table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for conversations
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id)
    `);

    // Create indexes for messages
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(recipient_id, read_at)
    `);

    console.log("✅ Database constraints and tables verified");
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

// Viewing request routes
app.use("/api/viewing-requests", viewingRequestRoutes);

// Message routes
app.use("/api/messages", messageRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
