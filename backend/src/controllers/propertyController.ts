import { Request, Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth";

// GET all properties (with optional filters)
export const getProperties = async (req: Request, res: Response) => {
  const { type, category, location, minPrice, maxPrice } = req.query;

  try {
    let query = "SELECT * FROM properties WHERE 1=1";
    const values: any[] = [];
    let i = 1;

    if (type) {
      query += ` AND type = $${i++}`;
      values.push(type);
    }
    if (category) {
      query += ` AND category = $${i++}`;
      values.push(category);
    }
    if (location) {
      query += ` AND location ILIKE $${i++}`;
      values.push(`%${location}%`);
    }
    if (minPrice) {
      query += ` AND price >= $${i++}`;
      values.push(minPrice);
    }
    if (maxPrice) {
      query += ` AND price <= $${i++}`;
      values.push(maxPrice);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// GET single property
export const getProperty = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.*, u.name as owner_name, u.phone as owner_phone
       FROM properties p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// POST create property
export const createProperty = async (req: AuthRequest, res: Response) => {
  const {
    title,
    description,
    price,
    type,
    category,
    location,
    area,
    bedrooms,
    bathrooms,
    images,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO properties
        (title, description, price, type, category, location, area, bedrooms, bathrooms, images, user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        title,
        description,
        price,
        type,
        category,
        location,
        area,
        bedrooms,
        bathrooms,
        images,
        req.userId,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Update Property
export const updateProperty = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    title,
    description,
    price,
    type,
    category,
    location,
    area,
    bedrooms,
    bathrooms,
    images,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE properties
       SET title = $1, description = $2, price = $3, type = $4, category = $5,
           location = $6, area = $7, bedrooms = $8, bathrooms = $9, images = $10
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [
        title,
        description,
        price,
        type,
        category,
        location,
        area,
        bedrooms,
        bathrooms,
        images,
        id,
        req.userId,
      ],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Property not found or unauthorized" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// DELETE property
export const deleteProperty = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM properties WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.userId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Property not found or unauthorized" });
    }

    res.json({ message: "Property deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
