import { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { googleConfigured } from "../config/passport";
import { register, login } from "../controllers/authController";

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

    // Generate JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // Clear the mode cookie
    res.clearCookie("google_auth_mode");

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const params = new URLSearchParams({
      token,
      name: user.name || "User",
      email: user.email || "",
      id: String(user.id),
    });

    res.redirect(`${frontendUrl}/?${params.toString()}`);
  },
);

export default router;
