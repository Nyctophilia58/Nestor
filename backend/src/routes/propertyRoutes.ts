import express from "express";
import {
  getProperties,
  getMyProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getFavourites,
  addFavourite,
  removeFavourite,
} from "../controllers/propertyController";
import { protect } from "../middleware/auth";

const router = express.Router();

// Static routes (must come before /:id parametric route)
router.get("/", getProperties);
router.get("/mine", protect, getMyProperties);
router.get("/favourites", protect, getFavourites);

// Parametric route (/:id) – must come AFTER static routes
router.get("/:id", getProperty);

// Protected routes (require authentication)
router.post("/", protect, createProperty);
router.put("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);
router.post("/:id/favourite", protect, addFavourite);
router.delete("/:id/favourite", protect, removeFavourite);

export default router;
