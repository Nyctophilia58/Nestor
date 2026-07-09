import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/db";

// Validators
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
  return phoneRegex.test(phone);
};

const isValidPassword = (password: string) => {
  const rules = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
  return rules;
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;

  // check if user already exists
  try {
    // Email format check
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    };

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Phone validation
    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({ message: "Invalid phone format" });
    };

    // Password validation
    const passwordRules = isValidPassword(password);
    if (!passwordRules.minLength) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    };
    if (!passwordRules.hasUppercase) {
      return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
    };
    if (!passwordRules.hasLowercase) {
      return res.status(400).json({ message: "Password must contain at least one lowercase letter" });
    };
    if (!passwordRules.hasNumber) {
      return res.status(400).json({ message: "Password must contain at least one number" });
    };
    if (!passwordRules.hasSpecial) {
      return res.status(400).json({ message: "Password must contain at least one special character (!@#$%^&*)" });
    };

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Only allow tenant or landlord on register — never admin
    const safeRole = role === "landlord" ? "landlord" : "tenant";

    // insert user into database
    const result = await pool.query(
      "INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role",
      [name, email, hashedPassword, phone, safeRole],
    );

    const user = result.rows[0];

    // generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // find user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error });
  }
};
