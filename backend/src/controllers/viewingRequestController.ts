import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth";

// Create a viewing request
export const createViewingRequest = async (req: AuthRequest, res: Response) => {
  const { property_id, preferred_date, preferred_time, message } = req.body;

  if (!property_id || !preferred_date || !preferred_time) {
    return res.status(400).json({
      message: "Property ID, preferred date, and preferred time are required",
    });
  }

  // Check if property exists
  try {
    const propertyCheck = await pool.query(
      "SELECT id, user_id, title FROM properties WHERE id = $1",
      [property_id],
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    const property = propertyCheck.rows[0];

    // Check if user is trying to request their own property
    if (property.user_id === req.userId) {
      return res.status(400).json({
        message: "You cannot request to view your own property",
      });
    }

    // Check for existing pending request
    const existingRequest = await pool.query(
      `SELECT id FROM viewing_requests 
       WHERE property_id = $1 AND user_id = $2 AND status = 'pending'`,
      [property_id, req.userId],
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({
        message: "You already have a pending viewing request for this property",
      });
    }

    const result = await pool.query(
      `INSERT INTO viewing_requests 
        (property_id, user_id, landlord_id, preferred_date, preferred_time, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
       RETURNING *`,
      [property_id, req.userId, property.user_id, preferred_date, preferred_time, message || null],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create viewing request error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get viewing requests for a property (for landlords to see requests on their properties)
export const getPropertyViewingRequests = async (
  req: AuthRequest,
  res: Response,
) => {
  const { property_id } = req.params;

  try {
    // Verify the property belongs to the requesting landlord
    const propertyCheck = await pool.query(
      "SELECT id, user_id FROM properties WHERE id = $1",
      [property_id],
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (propertyCheck.rows[0].user_id !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({
        message: "You can only view requests for your own properties",
      });
    }

    const result = await pool.query(
      `SELECT vr.*, u.name as tenant_name, u.email as tenant_email, u.phone as tenant_phone,
              p.title as property_title, p.location as property_location
       FROM viewing_requests vr
       JOIN users u ON vr.user_id = u.id
       JOIN properties p ON vr.property_id = p.id
       WHERE vr.property_id = $1
       ORDER BY vr.created_at DESC`,
      [property_id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get property viewing requests error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get my viewing requests (for tenants to see their sent requests)
export const getMyViewingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT vr.*, p.title as property_title, p.location as property_location, 
              p.images as property_images, p.price as property_price,
              u.name as landlord_name, u.email as landlord_email, u.phone as landlord_phone
       FROM viewing_requests vr
       JOIN properties p ON vr.property_id = p.id
       JOIN users u ON vr.landlord_id = u.id
       WHERE vr.user_id = $1
       ORDER BY vr.created_at DESC`,
      [req.userId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get my viewing requests error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get viewing requests for my properties (for landlords to see all requests on their properties)
export const getMyPropertyRequests = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT vr.*, p.title as property_title, p.location as property_location,
              p.images as property_images, p.price as property_price,
              u.name as tenant_name, u.email as tenant_email, u.phone as tenant_phone
       FROM viewing_requests vr
       JOIN properties p ON vr.property_id = p.id
       JOIN users u ON vr.user_id = u.id
       WHERE vr.landlord_id = $1
       ORDER BY vr.created_at DESC`,
      [req.userId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get my property requests error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Update viewing request status (approve/reject/cancel)
export const updateViewingRequest = async (
  req: AuthRequest,
  res: Response,
) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["pending", "approved", "rejected", "cancelled"].includes(status)) {
    return res.status(400).json({
      message: "Invalid status. Must be: pending, approved, rejected, or cancelled",
    });
  }

  try {
    // Get the viewing request
    const requestCheck = await pool.query(
      "SELECT * FROM viewing_requests WHERE id = $1",
      [id],
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ message: "Viewing request not found" });
    }

    const request = requestCheck.rows[0];

    // Check authorization:
    // - Tenants can only cancel their own requests
    // - Landlords can approve/reject requests for their properties
    // - Admins can update any request
    const isTenant = request.user_id === req.userId;
    const isLandlord = request.landlord_id === req.userId;
    const isAdmin = req.userRole === "admin";

    if (!isTenant && !isLandlord && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized to update this request" });
    }

    // Tenants can only cancel their own requests
    if (isTenant && status !== "cancelled") {
      return res.status(403).json({
        message: "Tenants can only cancel their viewing requests",
      });
    }

    // Landlords can only approve or reject
    if (isLandlord && !isAdmin && !["approved", "rejected"].includes(status)) {
      return res.status(403).json({
        message: "Landlords can only approve or reject viewing requests",
      });
    }

    // Can't change status if already cancelled
    if (request.status === "cancelled") {
      return res.status(400).json({ message: "This request has already been cancelled" });
    }

    const result = await pool.query(
      `UPDATE viewing_requests 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [status, id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update viewing request error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Delete a viewing request
export const deleteViewingRequest = async (
  req: AuthRequest,
  res: Response,
) => {
  const { id } = req.params;

  try {
    const requestCheck = await pool.query(
      "SELECT * FROM viewing_requests WHERE id = $1",
      [id],
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ message: "Viewing request not found" });
    }

    const request = requestCheck.rows[0];

    // Only the tenant who made the request, the landlord of the property, or an admin can delete
    if (
      request.user_id !== req.userId &&
      request.landlord_id !== req.userId &&
      req.userRole !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized to delete this request" });
    }

    await pool.query("DELETE FROM viewing_requests WHERE id = $1", [id]);

    res.json({ message: "Viewing request deleted" });
  } catch (err) {
    console.error("Delete viewing request error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Check if user has a pending request for a property
export const checkPropertyRequest = async (
  req: AuthRequest,
  res: Response,
) => {
  const { property_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, status FROM viewing_requests 
       WHERE property_id = $1 AND user_id = $2`,
      [property_id, req.userId],
    );

    if (result.rows.length > 0) {
      res.json({ has_request: true, request: result.rows[0] });
    } else {
      res.json({ has_request: false, request: null });
    }
  } catch (err) {
    console.error("Check property request error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};