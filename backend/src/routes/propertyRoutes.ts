import express from "express";
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyController";
import { protect } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/", getProperties);
router.get("/:id", getProperty);

// Protected routes (require authentication)
router.post("/", protect, createProperty);
router.put("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);

export default router;
