// Real-time chat service using Socket.IO
import jwt from 'jsonwebtoken';

// Store active user connections: userId -> socketId
const activeUsers = new Map();

export function setupSocketIO(io, prisma) {
  io.use((socket, next) => {
    // Authenticate socket connection
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // The token has 'id' property, not 'userId'
      socket.userId = decoded.id;
      console.log('Socket authenticated for user:', decoded.id);
      next();
    } catch (error) {
      console.error('Socket auth error:', error.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`✅ User ${userId} connected to chat`);
    
    // Store active user connection
    activeUsers.set(userId, socket.id);
    
    // Notify others that user is online
    socket.broadcast.emit('user_online', { userId });

    // Join conversation rooms
    socket.on('join_conversation', async (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    // Leave conversation rooms
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle new message
    socket.on('send_message', async (data) => {
      const { conversationId, content, receiverId } = data;
      
      try {
        // Save message to database
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            content,
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
        });

        // Update conversation's lastMessageAt
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: new Date() },
        });

        // Emit message to conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', message);

        // Send push notification to receiver if they're not in the conversation
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message_notification', {
            conversationId,
            senderId: userId,
            senderName: `${message.sender.firstName} ${message.sender.lastName}`,
            preview: content.substring(0, 50),
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', ({ conversationId, receiverId }) => {
      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', { conversationId, userId });
      }
    });

    socket.on('typing_stop', ({ conversationId, receiverId }) => {
      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stopped_typing', { conversationId, userId });
      }
    });

    // Mark messages as read
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: userId },
            read: false,
          },
          data: { read: true },
        });

        // Notify sender that messages were read
        socket.to(`conversation:${conversationId}`).emit('messages_read', { conversationId });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User ${userId} disconnected from chat`);
      activeUsers.delete(userId);
      
      // Notify others that user is offline
      socket.broadcast.emit('user_offline', { userId });
    });
  });

  // Export function to check if user is online
  io.isUserOnline = (userId) => activeUsers.has(userId);
}
