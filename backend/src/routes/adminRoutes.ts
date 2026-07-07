import { Router } from "express";
import { protect, isAdmin } from "../middleware/auth";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { Response } from "express";

const router = Router();

// GET all users
router.get(
  "/users",
  protect,
  isAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        "SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC",
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// UPDATE user role
router.put(
  "/users/:id/role",
  protect,
  isAdmin,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!["tenant", "landlord", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    try {
      const result = await pool.query(
        "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role",
        [role, id],
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE user
router.delete(
  "/users/:id",
  protect,
  isAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// GET all tickets
router.get(
  "/tickets",
  protect,
  isAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        "SELECT * FROM tickets ORDER BY created_at DESC",
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

export default router;
