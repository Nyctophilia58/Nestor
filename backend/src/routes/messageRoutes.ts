import { Router } from "express";
import {
  sendMessage,
  getConversations,
  getConversationMessages,
  getConversationWithUser,
  markAsRead,
  getUnreadCount,
  startPropertyConversation,
} from "../controllers/messageController";
import { protect } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(protect);

// Send a message
router.post("/", sendMessage);

// Get all conversations
router.get("/conversations", getConversations);

// Get unread message count
router.get("/unread", getUnreadCount);

// Get or create conversation with specific user
router.get("/user/:user_id", getConversationWithUser);

// Get messages in a conversation
router.get("/conversation/:conversation_id", getConversationMessages);

// Mark conversation messages as read
router.patch("/conversation/:conversation_id/read", markAsRead);

// Start conversation about a property (with initial message)
router.post("/property", startPropertyConversation);

export default router;