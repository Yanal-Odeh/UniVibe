import prisma from '../utils/prisma.js';

// Get notifications for the current user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware adds user to req
    
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            status: true,
            deanOfFacultyRevisionMessage: true,
            facultyLeaderRevisionResponse: true,
            deanshipRevisionMessage: true,
            deanOfFacultyRevisionResponse: true,
            community: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id: id,
        userId: userId
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id: id },
      data: { read: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        userId: userId,
        read: false
      },
      data: {
        read: true
      }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
};

// Create notification (internal helper function)
export const createNotification = async (userId, eventId, type, message) => {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        eventId,
        type,
        message
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
