import { Request, Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth";

// GET all properties (with optional filters & pagination)
export const getProperties = async (req: Request, res: Response) => {
  const { type, category, location, minPrice, maxPrice } = req.query;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(req.query.limit as string) || 9),
  );
  const offset = (page - 1) * limit;

  try {
    let whereClause = "WHERE 1=1";
    const values: any[] = [];
    let i = 1;

    if (type) {
      whereClause += ` AND type = $${i++}`;
      values.push(type);
    }
    if (category) {
      whereClause += ` AND category = $${i++}`;
      values.push(category);
    }
    if (location) {
      whereClause += ` AND location ILIKE $${i++}`;
      values.push(`%${location}%`);
    }
    if (minPrice) {
      whereClause += ` AND price >= $${i++}`;
      values.push(minPrice);
    }
    if (maxPrice) {
      whereClause += ` AND price <= $${i++}`;
      values.push(maxPrice);
    }

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM properties ${whereClause}`,
      values,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated data
    const dataResult = await pool.query(
      `SELECT * FROM properties ${whereClause} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i}`,
      [...values, limit, offset],
    );

    res.json({
      properties: dataResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
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

// GET my properties
export const getMyProperties = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM properties WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId],
    );
    res.json(result.rows);
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

// ADD favourite
export const addFavourite = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query(
      "INSERT INTO favourites (user_id, property_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.userId, id],
    );
    res.json({ message: "Added to favourites" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// REMOVE favourite
export const removeFavourite = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query(
      "DELETE FROM favourites WHERE user_id = $1 AND property_id = $2",
      [req.userId, id],
    );
    res.json({ message: "Removed from favourites" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// GET my favourites
export const getFavourites = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.* FROM properties p
       JOIN favourites f ON p.id = f.property_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.userId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
