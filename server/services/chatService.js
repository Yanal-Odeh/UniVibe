import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const chatService = {
  // Get all conversations for a user with last message preview
  async getUserConversations(userId) {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            read: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Transform to include the other user and unread count
    const conversationsWithMessages = await Promise.all(
      conversations
        .filter(conv => conv.messages.length > 0) // Only include conversations with messages
        .map(async (conv) => {
          const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;
          const lastMessage = conv.messages[0] || null;
          
          // Count unread messages
          const unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              senderId: otherUser.id,
              read: false,
            },
          });

          return {
            id: conv.id,
            otherUser,
            lastMessage,
            unreadCount,
            lastMessageAt: conv.lastMessageAt,
          };
        })
    );
    
    return conversationsWithMessages;
  },

  // Get or create a conversation between two users
  async getOrCreateConversation(user1Id, user2Id) {
    // Ensure user1Id is always the smaller ID for consistency
    const [firstUserId, secondUserId] = [user1Id, user2Id].sort();

    // Try to find existing conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id: firstUserId,
          user2Id: secondUserId,
        },
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create if doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: firstUserId,
          user2Id: secondUserId,
        },
        include: {
          user1: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          user2: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    }

    // Return with the other user
    const otherUser = conversation.user1Id === user1Id ? conversation.user2 : conversation.user1;
    
    return {
      id: conversation.id,
      otherUser,
      createdAt: conversation.createdAt,
    };
  },

  // Get messages for a conversation with pagination
  async getConversationMessages(conversationId, userId, limit = 50, before = null) {
    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(before && {
          createdAt: { lt: new Date(before) },
        }),
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Return in chronological order
    return messages.reverse();
  },

  // Search for users by name or email
  async searchUsers(query, currentUserId) {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } }, // Exclude current user
          {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      take: 20,
    });

    return users;
  },

  // Get users organized by role for browsing
  async getUsersByRole(currentUserId) {
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId }, // Exclude current user
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      orderBy: [
        { role: 'asc' },
        { firstName: 'asc' },
      ],
    });

    // Group users by role
    const roleLabels = {
      ADMIN: 'Administrators',
      DEANSHIP_OF_STUDENT_AFFAIRS: 'Deanship of Student Affairs',
      DEAN_OF_FACULTY: 'Deans of Faculty',
      FACULTY_LEADER: 'Faculty Leaders',
      CLUB_LEADER: 'Club Leaders',
      STUDENT: 'Students',
    };

    const grouped = users.reduce((acc, user) => {
      const roleLabel = roleLabels[user.role] || user.role;
      if (!acc[roleLabel]) {
        acc[roleLabel] = [];
      }
      acc[roleLabel].push(user);
      return acc;
    }, {});

    return grouped;
  },

  // Get unread message count for a user
  async getUnreadCount(userId) {
    // Get all conversations for this user
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      select: { id: true },
    });

    const conversationIds = conversations.map((c) => c.id);

    // Count unread messages from others
    const count = await prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: userId },
        read: false,
      },
    });

    return count;
  },

  // Delete a conversation (soft delete - only removes for the user)
  async deleteConversation(conversationId, userId) {
    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    // For now, we'll do a hard delete. 
    // In production, you might want to implement soft delete per user
    await prisma.conversation.delete({
      where: { id: conversationId },
    });
  },
};
