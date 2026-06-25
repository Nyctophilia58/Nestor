import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/db";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  // check if user already exists
  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user into database
    const result = await pool.query(
      "INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, email",
      [name, email, hashedPassword, phone],
    );

    const user = result.rows[0];

    // generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
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
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error });
  }
};
