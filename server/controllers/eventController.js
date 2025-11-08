import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllEvents = async (req, res) => {
  try {
    const { search, communityId, upcoming } = req.query;

    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (communityId) {
      where.communityId = communityId;
    }

    if (upcoming === 'true') {
      where.startDate = {
        gte: new Date()
      };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        community: {
          select: {
            id: true,
            name: true,
            avatar: true,
            color: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        community: {
          select: {
            id: true,
            name: true,
            avatar: true,
            color: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, location, startDate, endDate, communityId } = req.body;

    // Validate input
    if (!title || !description || !location || !startDate) {
      return res.status(400).json({ error: 'Required fields: title, description, location, startDate' });
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        communityId: communityId || null,
        createdBy: req.user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        community: {
          select: {
            id: true,
            name: true,
            avatar: true,
            color: true
          }
        }
      }
    });

    res.status(201).json({ event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, startDate, endDate, communityId } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (communityId !== undefined) updateData.communityId = communityId || null;

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        community: {
          select: {
            id: true,
            name: true,
            avatar: true,
            color: true
          }
        }
      }
    });

    res.json({ event });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Event not found' });
    }
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.event.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Event not found' });
    }
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};
