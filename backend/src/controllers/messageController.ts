import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth";

// Send a message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  const { recipient_id, property_id, content } = req.body;

  if (!recipient_id || !content) {
    return res.status(400).json({ message: "Recipient and message content are required" });
  }

  if (content.trim().length === 0) {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  try {
    // Check if recipient exists
    const recipientCheck = await pool.query(
      "SELECT id, name, role FROM users WHERE id = $1",
      [recipient_id],
    );

    if (recipientCheck.rows.length === 0) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Can't message yourself
    if (recipient_id === req.userId) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    // Get or create conversation
    const conversationResult = await pool.query(
      `INSERT INTO conversations (user1_id, user2_id)
       VALUES (
         LEAST($1::int, $2::int),
         GREATEST($1::int, $2::int)
       )
       ON CONFLICT (user1_id, user2_id) DO UPDATE SET updated_at = NOW()
       RETURNING id`,
      [req.userId, recipient_id],
    );

    const conversation_id = conversationResult.rows[0].id;

    // Insert message
    const messageResult = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, recipient_id, property_id, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [conversation_id, req.userId, recipient_id, property_id || null, content.trim()],
    );

    // Update conversation timestamp
    await pool.query(
      "UPDATE conversations SET updated_at = NOW() WHERE id = $1",
      [conversation_id],
    );

    res.status(201).json(messageResult.rows[0]);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get all conversations for current user
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT
        c.id as conversation_id,
        c.updated_at,
        CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END as other_user_id,
        u.name as other_user_name,
        u.role as other_user_role,
        u.avatar as other_user_avatar,
        (
          SELECT content FROM messages
          WHERE conversation_id = c.id
          ORDER BY created_at DESC LIMIT 1
        ) as last_message,
        (
          SELECT created_at FROM messages
          WHERE conversation_id = c.id
          ORDER BY created_at DESC LIMIT 1
        ) as last_message_at,
        (
          SELECT COUNT(*) FROM messages
          WHERE conversation_id = c.id AND recipient_id = $1 AND read_at IS NULL
        ) as unread_count
      FROM conversations c
      JOIN users u ON u.id = CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY COALESCE(
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1),
        c.updated_at
      ) DESC`,
      [req.userId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get messages in a conversation
export const getConversationMessages = async (req: AuthRequest, res: Response) => {
  const { conversation_id } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 50));
  const offset = (page - 1) * limit;

  try {
    // Verify user is part of this conversation
    const conversationCheck = await pool.query(
      "SELECT * FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)",
      [conversation_id, req.userId],
    );

    if (conversationCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied to this conversation" });
    }

    // Get messages
    const messagesResult = await pool.query(
      `SELECT m.*,
              sender.name as sender_name,
              sender.avatar as sender_avatar,
              recipient.name as recipient_name,
              p.title as property_title,
              p.images as property_images
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users recipient ON m.recipient_id = recipient.id
       LEFT JOIN properties p ON m.property_id = p.id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [conversation_id, limit, offset],
    );

    // Get total count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM messages WHERE conversation_id = $1",
      [conversation_id],
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Mark messages as read
    await pool.query(
      `UPDATE messages
       SET read_at = NOW()
       WHERE conversation_id = $1 AND recipient_id = $2 AND read_at IS NULL`,
      [conversation_id, req.userId],
    );

    res.json({
      messages: messagesResult.rows.reverse(), // Reverse to get chronological order
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Get conversation messages error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get conversation with a specific user
export const getConversationWithUser = async (req: AuthRequest, res: Response) => {
  const user_id = req.params.user_id as string;
  const otherUserId = parseInt(user_id, 10);

  if (!Number.isFinite(otherUserId) || otherUserId <= 0) {
    return res.status(400).json({ message: "Invalid user_id" });
  }

  try {
    // Find existing conversation
    const conversationResult = await pool.query(
      `SELECT id FROM conversations
       WHERE (user1_id = $1 AND user2_id = $2)
          OR (user1_id = $2 AND user2_id = $1)`,
      [req.userId, otherUserId],
    );

    if (conversationResult.rows.length === 0) {
      // No conversation exists, create one
      const newConversation = await pool.query(
        `INSERT INTO conversations (user1_id, user2_id)
         VALUES (LEAST($1::int, $2::int), GREATEST($1::int, $2::int))
         RETURNING id`,
        [req.userId, otherUserId],
      );
      return res.json({ conversation_id: newConversation.rows[0].id, created: true });
    }

    res.json({ conversation_id: conversationResult.rows[0].id, created: false });
  } catch (err) {
    console.error("Get conversation with user error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Mark messages as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  const { conversation_id } = req.params;

  try {
    // Verify user is part of this conversation
    const conversationCheck = await pool.query(
      "SELECT * FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)",
      [conversation_id, req.userId],
    );

    if (conversationCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied to this conversation" });
    }

    await pool.query(
      `UPDATE messages
       SET read_at = NOW()
       WHERE conversation_id = $1 AND recipient_id = $2 AND read_at IS NULL`,
      [conversation_id, req.userId],
    );

    res.json({ message: "Messages marked as read" });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get unread message count
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as unread
       FROM messages
       WHERE recipient_id = $1 AND read_at IS NULL`,
      [req.userId],
    );

    res.json({ unread_count: parseInt(result.rows[0].unread, 10) });
  } catch (err) {
    console.error("Get unread count error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Start a conversation about a property
export const startPropertyConversation = async (req: AuthRequest, res: Response) => {
  const { property_id, message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ message: "Initial message is required" });
  }

  try {
    // Get property owner
    const propertyCheck = await pool.query(
      "SELECT id, user_id, title FROM properties WHERE id = $1",
      [property_id],
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    const property = propertyCheck.rows[0];

    if (property.user_id === req.userId) {
      return res.status(400).json({ message: "You cannot message yourself about your own property" });
    }

    // Create/get conversation
    const conversationResult = await pool.query(
      `INSERT INTO conversations (user1_id, user2_id)
       VALUES (LEAST($1::int, $2::int), GREATEST($1::int, $2::int))
       ON CONFLICT (user1_id, user2_id) DO UPDATE SET updated_at = NOW()
       RETURNING id`,
      [req.userId, property.user_id],
    );

    const conversation_id = conversationResult.rows[0].id;

    // Send initial message
    const messageResult = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, recipient_id, property_id, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [conversation_id, req.userId, property.user_id, property_id, message.trim()],
    );

    res.status(201).json({
      conversation_id,
      message: messageResult.rows[0],
    });
  } catch (err) {
    console.error("Start property conversation error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};
