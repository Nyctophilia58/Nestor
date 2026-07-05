import { Request, Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth";

export const createTicket = async (req: AuthRequest, res: Response) => {
  const { name, email, category, subject, message } = req.body;

  if (!name || !email || !category || !subject || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tickets (user_id, name, email, category, subject, message)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId || null, name, email, category, subject, message],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
