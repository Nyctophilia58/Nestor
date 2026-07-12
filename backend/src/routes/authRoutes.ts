import { Router } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import passport from "passport";
import { googleConfigured } from "../config/passport";
import pool from "../config/db";
import { register, login } from "../controllers/authController";
import { sendPasswordResetEmail } from "../utils/mail";
import { protect, AuthRequest } from "../middleware/auth";
import { Response as ExpressResponse } from "express";


const router = Router();

router.post("/register", register);
router.post("/login", login);

// ─── Google OAuth ───

// 1. Redirect user to Google (login or register)
router.get("/google", (req, res, next) => {
  if (!googleConfigured) {
    return res.status(503).json({
      message:
        "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
    });
  }

  const mode = req.query.mode === "register" ? "register" : "login";

  // Store mode in a cookie for the callback
  res.cookie("google_auth_mode", mode, {
    httpOnly: true,
    maxAge: 5 * 60 * 1000, // 5 minutes
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

// 2. Google redirects back here
router.get(
  "/google/callback",
  (req, res, next) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    passport.authenticate("google", {
      failureRedirect: `${frontendUrl}/login?error=google_auth_failed`,
      session: false,
    })(req, res, next);
  },
  (req, res) => {
    const user = req.user as any;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Read and clear the mode cookie
    const mode = req.cookies?.google_auth_mode || "login";
    res.clearCookie("google_auth_mode");

    // Pending Google registration — user hasn't chosen role/phone yet
    if (user._pendingRegistration) {
      const params = new URLSearchParams({
        google_id: user.google_id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      });
      return res.redirect(`${frontendUrl}/register?${params.toString()}`);
    }

    // Existing user — generate JWT and check mode
    if (mode === "register") {
      // User already has an account, redirect to register with error
      return res.redirect(
        `${frontendUrl}/register?error=existing_account&email=${user.email}`,
      );
    }

    // Login mode: log the user in normally
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    const params = new URLSearchParams({
      token,
      name: user.name || "User",
      email: user.email || "",
      id: String(user.id),
      role: user.role || "tenant",
    });

    res.redirect(`${frontendUrl}/?${params.toString()}`);
  },
);

// 3. Complete Google registration (user submits phone + role on register page)
router.post("/complete-google", async (req, res) => {
  const { google_id, name, email, phone, role, avatar } = req.body;

  if (!google_id || !email) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if user was already created (e.g. double submit)
    const existing = await pool.query(
      "SELECT * FROM users WHERE google_id = $1 OR email = $2",
      [google_id, email],
    );
    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" },
      );
      return res.json({ user, token });
    }

    const randomPwd = Math.random().toString(36).slice(-20);
    const hashedPwd = await bcryptjs.hash(randomPwd, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, google_id, avatar, phone, role, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, role",
      [name, email, google_id, avatar, phone, role || "tenant", hashedPwd],
    );

    const newUser = result.rows[0];
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ─── Email Verification (OTP) ───

// Ensure email_verified and OTP columns exist
const ensureVerificationColumns = async () => {
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_otp VARCHAR(6)`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_otp_expiry TIMESTAMP`);
};

// Send verification OTP
router.post('/send-verification-otp', protect, async (req: AuthRequest, res: ExpressResponse) => {
  try {
    await ensureVerificationColumns();
    
    const result = await pool.query('SELECT email, email_verified FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    
    if (user.email_verified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await pool.query(
      'UPDATE users SET verification_otp = $1, verification_otp_expiry = $2 WHERE id = $3',
      [otp, expiry, req.userId]
    );
    
    // Send email with OTP
    try {
      const { sendVerificationEmail } = await import("../utils/mail");
      await sendVerificationEmail(user.email, otp);
    } catch (emailError) {
      // If email fails, log the OTP for development
      console.log(`[DEV] Verification OTP for ${user.email}: ${otp}`);
    }
    
    res.json({ message: 'Verification code sent to your email', email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify email with OTP
router.post('/verify-email-otp', protect, async (req: AuthRequest, res: ExpressResponse) => {
  const { otp } = req.body;
  
  if (!otp || otp.length !== 6) {
    return res.status(400).json({ message: 'Please enter a valid 6-digit code' });
  }
  
  try {
    await ensureVerificationColumns();
    
    const result = await pool.query(
      'SELECT verification_otp, verification_otp_expiry, email FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    
    if (!user.verification_otp) {
      return res.status(400).json({ message: 'No verification code sent. Please request a new one.' });
    }
    
    if (new Date() > new Date(user.verification_otp_expiry)) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }
    
    if (user.verification_otp !== otp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Update user as verified and clear OTP
    await pool.query(
      'UPDATE users SET email_verified = TRUE, verification_otp = NULL, verification_otp_expiry = NULL WHERE id = $1',
      [req.userId]
    );
    
    // Return updated user data
    const updatedUser = await pool.query(
      'SELECT id, name, email, phone, role, avatar, bio, created_at, email_verified FROM users WHERE id = $1',
      [req.userId]
    );
    
    res.json({ 
      message: 'Email verified successfully!',
      user: updatedUser.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user (updated to include email_verified)
router.get('/me', protect, async (req: AuthRequest, res: ExpressResponse) => {
  try {
    await ensureVerificationColumns();
    const result = await pool.query(
      'SELECT id, name, email, phone, avatar, bio, role, created_at, email_verified FROM users WHERE id = $1',
      [req.userId]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
});

// Update user profile (updated to include email_verified in response)
router.put('/profile', protect, async (req: AuthRequest, res: ExpressResponse) => {
  const { name, phone, bio, avatar } = req.body
  const updates: string[] = []
  const values: any[] = []
  let idx = 1
  if (name !== undefined) { updates.push(`name = $${idx++}`); values.push(name) }
  if (phone !== undefined) { updates.push(`phone = $${idx++}`); values.push(phone) }
  if (bio !== undefined) { updates.push(`bio = $${idx++}`); values.push(bio) }
  if (avatar !== undefined && avatar !== '') { updates.push(`avatar = $${idx++}`); values.push(avatar) }
  if (updates.length === 0) {
    return res.json({ message: 'Nothing to update' })
  }
  values.push(req.userId)
  try {
    await ensureVerificationColumns();
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, email, phone, avatar, bio, role, created_at, email_verified`,
      values
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// update bio
router.put('/bio', protect, async (req: AuthRequest, res: ExpressResponse) => {
  const { bio } = req.body
  if (!bio || bio === '') {
    return res.status(400).json({ message: 'Bio cannot be empty' })
  }
  try {
    const result = await pool.query(
      'UPDATE users SET bio = $1 WHERE id = $2 RETURNING id, name, email, phone, avatar, bio, role',
      [bio, req.userId]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update role (admin users are forbidden from changing role)
router.patch('/role', protect, async (req: AuthRequest, res: ExpressResponse) => {
const { role: newRole } = req.body
if (!newRole || !['tenant', 'landlord'].includes(newRole)) {
  return res.status(400).json({ message: 'Invalid role' })
}
try {
  // Fetch current user role
  const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [req.userId])
  if (userResult.rows.length === 0) {
    return res.status(404).json({ message: 'User not found' })
  }
  if (userResult.rows[0].role === 'admin') {
    return res.status(403).json({ message: 'Admins cannot change their role' })
  }
  const result = await pool.query(
    'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, phone, avatar, role',
    [newRole, req.userId]
  )
  res.json(result.rows[0])
} catch (err) {
  res.status(500).json({ message: 'Server error' })
}
})

// Change password
router.put('/change-password', protect, async (req: AuthRequest, res: ExpressResponse) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' })
  }
  try {
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.userId])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }
    const isMatch = await bcryptjs.compare(currentPassword, result.rows[0].password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }
    const hashedPassword = await bcryptjs.hash(newPassword, 10)
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.userId])
    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete account
router.delete('/me', protect, async (req: AuthRequest, res: ExpressResponse) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.userId])
    res.json({ message: 'Account deleted', code: 'ACCOUNT_DELETED' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// ─── Gate Forgot Password ───

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  console.log("[Forgot Password Request]", { email });

  // Always return the same response to prevent email enumeration
  const genericResponse = {
    message: "If that email exists, a reset link has been sent.",
  };

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Please provide a valid email." });
  }

  try {
    // Ensure columns exist (best-effort, will silently skip if already there)
    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)`,
    );
    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP`,
    );

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "No account found with this email. Please register first.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
      [token, expiry, email],
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, resetUrl);

    res.json(genericResponse);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ─── Reset Password ───

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1",
      [token],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = result.rows[0];

    if (new Date() > new Date(user.reset_token_expiry)) {
      return res
        .status(400)
        .json({ message: "Reset link has expired. Please request a new one." });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2",
      [hashedPassword, user.id],
    );

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
