import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Save an event
export const saveEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if already saved
    const existingSave = await prisma.savedEvent.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (existingSave) {
      return res.status(400).json({ error: 'Event already saved' });
    }

    // Save the event
    const savedEvent = await prisma.savedEvent.create({
      data: {
        userId,
        eventId
      }
    });

    res.json({
      message: 'Event saved successfully',
      savedEvent
    });
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ error: 'Failed to save event' });
  }
};

// Unsave an event
export const unsaveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if saved
    const savedEvent = await prisma.savedEvent.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (!savedEvent) {
      return res.status(404).json({ error: 'Saved event not found' });
    }

    // Delete the saved event
    await prisma.savedEvent.delete({
      where: {
        id: savedEvent.id
      }
    });

    res.json({
      message: 'Event removed from saved'
    });
  } catch (error) {
    console.error('Error unsaving event:', error);
    res.status(500).json({ error: 'Failed to unsave event' });
  }
};

// Get user's saved events
export const getSavedEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const savedEvents = await prisma.savedEvent.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            community: true,
            college: true,
            eventLocation: true,
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            _count: {
              select: { registrations: true }
            }
          }
        }
      },
      orderBy: {
        savedAt: 'desc'
      }
    });

    res.json(savedEvents);
  } catch (error) {
    console.error('Error fetching saved events:', error);
    res.status(500).json({ error: 'Failed to fetch saved events' });
  }
};

// Check if event is saved
export const checkSavedEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const savedEvent = await prisma.savedEvent.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    res.json({
      isSaved: !!savedEvent,
      savedEvent
    });
  } catch (error) {
    console.error('Error checking saved event:', error);
    res.status(500).json({ error: 'Failed to check saved event' });
  }
};
