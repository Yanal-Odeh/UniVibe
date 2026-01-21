import { chatService } from '../services/chatService.js';

export const chatController = {
  // Get all conversations for the current user
  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      const conversations = await chatService.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  },

  // Get or create a conversation with another user
  async getOrCreateConversation(req, res) {
    try {
      const userId = req.user.id;
      const { otherUserId } = req.params;
      
      console.log('Getting/creating conversation:', { userId, otherUserId });
      
      const conversation = await chatService.getOrCreateConversation(userId, otherUserId);
      
      console.log('Conversation response:', conversation);
      
      res.json(conversation);
    } catch (error) {
      console.error('Error getting conversation:', error);
      res.status(500).json({ error: 'Failed to get conversation' });
    }
  },

  // Get messages for a specific conversation
  async getMessages(req, res) {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;
      const { limit = 50, before } = req.query;
      
      const messages = await chatService.getConversationMessages(
        conversationId,
        userId,
        parseInt(limit),
        before
      );
      
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  },

  // Search for users to chat with
  async searchUsers(req, res) {
    try {
      const userId = req.user.id;
      const { query } = req.query;
      
      if (!query || query.trim().length < 2) {
        return res.json([]);
      }
      
      const users = await chatService.searchUsers(query, userId);
      res.json(users);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  },

  // Get users organized by role for browsing
  async browseUsers(req, res) {
    try {
      const userId = req.user.id;
      const usersByRole = await chatService.getUsersByRole(userId);
      res.json(usersByRole);
    } catch (error) {
      console.error('Error browsing users:', error);
      res.status(500).json({ error: 'Failed to browse users' });
    }
  },

  // Get unread message count
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await chatService.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  },

  // Delete a conversation
  async deleteConversation(req, res) {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;
      
      await chatService.deleteConversation(conversationId, userId);
      res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  },
};
