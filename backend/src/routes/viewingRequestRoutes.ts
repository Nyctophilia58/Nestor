import { Router } from "express";
import {
  createViewingRequest,
  getPropertyViewingRequests,
  getMyViewingRequests,
  getMyPropertyRequests,
  updateViewingRequest,
  deleteViewingRequest,
  checkPropertyRequest,
} from "../controllers/viewingRequestController";
import { protect } from "../middleware/auth";

const router = Router();

// Create a viewing request
router.post("/", protect, createViewingRequest);

// Check if user has a request for a property
router.get("/check/:property_id", protect, checkPropertyRequest);

// Get my viewing requests (tenant's sent requests)
router.get("/mine", protect, getMyViewingRequests);

// Get viewing requests for my properties (landlord's received requests)
router.get("/my-properties", protect, getMyPropertyRequests);

// Get viewing requests for a specific property (landlord only)
router.get("/property/:property_id", protect, getPropertyViewingRequests);

// Update viewing request status
router.patch("/:id", protect, updateViewingRequest);

// Delete a viewing request
router.delete("/:id", protect, deleteViewingRequest);

export default router;