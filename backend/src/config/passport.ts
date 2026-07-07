import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Request } from "express";
import pool from "./db";
import bcryptjs from "bcryptjs";

// Export so routes can check if Google OAuth is ready
export let googleConfigured = false;

function initGoogleStrategy() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    console.warn(
      "⚠️  Google OAuth not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing)",
    );
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        passReqToCallback: true,
      },
      async (req: Request, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email from Google"), false);
          }

          // Read mode from cookie: "login" or "register"
          const mode = req.cookies?.google_auth_mode || "login";

          // Check if user exists by google_id or email
          const existingUser = await pool.query(
            "SELECT * FROM users WHERE google_id = $1 OR email = $2",
            [profile.id, email],
          );

          if (existingUser.rows.length > 0) {
            const user = existingUser.rows[0];
            // Update google_id if not already linked
            if (!user.google_id) {
              await pool.query(
                "UPDATE users SET google_id = $1, avatar = $2 WHERE id = $3",
                [profile.id, profile.photos?.[0]?.value, user.id],
              );
            }
            return done(null, {
              id: user.id,
              name: user.name || profile.displayName,
              email: user.email,
              role: user.role || "tenant",
              avatar: user.avatar || profile.photos?.[0]?.value,
            });
          }

          // User not found — behaviour depends on mode
          if (mode === "login") {
            // Login mode: don't create new user
            return done(null, false, {
              message:
                "No account found with this Google account. Please register first.",
            });
          }

          // Register mode: don't create user yet — pass profile for form completion
          done(null, {
            _pendingRegistration: true,
            name: profile.displayName,
            email: email,
            google_id: profile.id,
            avatar: profile.photos?.[0]?.value || "",
          });
        } catch (err) {
          done(err as Error, false);
        }
      },
    ),
  );

  googleConfigured = true;
  console.log("✅ Google OAuth strategy registered");
}

initGoogleStrategy();

export default passport;
