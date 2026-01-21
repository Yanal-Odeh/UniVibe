import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { chatController } from '../controllers/chatController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all conversations for current user
router.get('/conversations', chatController.getConversations);

// Get or create conversation with another user
router.get('/conversations/:otherUserId', chatController.getOrCreateConversation);

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', chatController.getMessages);

// Search for users
router.get('/users/search', chatController.searchUsers);

// Browse users by role
router.get('/users/browse', chatController.browseUsers);

// Get unread message count
router.get('/unread-count', chatController.getUnreadCount);

// Delete a conversation
router.delete('/conversations/:conversationId', chatController.deleteConversation);

export default router;
