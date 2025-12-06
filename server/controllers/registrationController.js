import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Register for an event
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    // Check if user is a student
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Only students can register for events' });
    }

    // Check if event exists and is approved
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Event is not yet approved' });
    }

    // Check if event has capacity and if it's full
    if (event.capacity && event._count.registrations >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if user is already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'You are already registered for this event' });
    }

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        userId,
        eventId
      }
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId,
        eventId,
        type: 'EVENT_APPROVED', // Reusing this type for successful registration
        message: `Successfully registered for "${event.title}"`,
        read: false
      }
    });

    // Get updated registration count
    const updatedEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    res.json({
      message: 'Successfully registered for event',
      registration,
      currentAttendees: updatedEvent._count.registrations,
      capacity: updatedEvent.capacity
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
};

// Unregister from an event
export const unregisterFromEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if registration exists
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Get event details for notification
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    // Delete registration
    await prisma.eventRegistration.delete({
      where: {
        id: registration.id
      }
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId,
        eventId,
        type: 'EVENT_REJECTED', // Reusing this type for cancellation
        message: `Registration cancelled for "${event.title}"`,
        read: false
      }
    });

    // Get updated registration count
    const updatedEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    res.json({
      message: 'Successfully unregistered from event',
      currentAttendees: updatedEvent._count.registrations,
      capacity: updatedEvent.capacity
    });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({ error: 'Failed to unregister from event' });
  }
};

// Get user's registered events
export const getUserRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;

    const registrations = await prisma.eventRegistration.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            community: true,
            college: true,
            eventLocation: true,
            _count: {
              select: { registrations: true }
            }
          }
        }
      },
      orderBy: {
        registeredAt: 'desc'
      }
    });

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

// Get event registrations (for event creators/admins)
export const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user has permission (event creator or admin)
    if (event.createdBy !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You do not have permission to view registrations' });
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        registeredAt: 'asc'
      }
    });

    res.json({
      eventId,
      totalRegistrations: registrations.length,
      capacity: event.capacity,
      registrations
    });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ error: 'Failed to fetch event registrations' });
  }
};

// Check if user is registered for an event
export const checkRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const registration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    res.json({
      isRegistered: !!registration,
      registration
    });
  } catch (error) {
    console.error('Error checking registration:', error);
    res.status(500).json({ error: 'Failed to check registration' });
  }
};
