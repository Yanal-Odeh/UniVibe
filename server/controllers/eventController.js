import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllEvents = async (req, res) => {
  try {
    const { search, communityId, upcoming } = req.query;

    const where = {
      status: 'APPROVED' // Only show approved events to public
    };
    
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
    const { title, description, collegeId, locationId, startDate, endDate, communityId } = req.body;

    // Validate input
    if (!title || !description || !locationId || !startDate || !communityId) {
      return res.status(400).json({ error: 'Required fields: title, description, locationId, startDate, communityId' });
    }

    // Get community to use its college
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: { college: true }
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (!community.collegeId) {
      return res.status(400).json({ error: 'Community must be assigned to a college' });
    }

    // Get location details for display
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: { college: true }
    });

    const locationDisplay = location ? `${location.college.name} - ${location.name}` : '';

    // Check for conflicts with approved events at the same time and location
    const eventStartDate = new Date(startDate);
    const eventEndDate = endDate ? new Date(endDate) : new Date(eventStartDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours if no end date

    const conflictingEvents = await prisma.event.findMany({
      where: {
        locationId,
        status: 'APPROVED',
        OR: [
          {
            // New event starts during existing event
            AND: [
              { startDate: { lte: eventStartDate } },
              { 
                OR: [
                  { endDate: { gte: eventStartDate } },
                  { endDate: null }
                ]
              }
            ]
          },
          {
            // New event ends during existing event
            AND: [
              { startDate: { lte: eventEndDate } },
              { 
                OR: [
                  { endDate: { gte: eventEndDate } },
                  { endDate: null }
                ]
              }
            ]
          },
          {
            // New event completely contains existing event
            AND: [
              { startDate: { gte: eventStartDate } },
              { startDate: { lte: eventEndDate } }
            ]
          }
        ]
      },
      include: {
        community: {
          select: {
            name: true
          }
        }
      }
    });

    if (conflictingEvents.length > 0) {
      const conflict = conflictingEvents[0];
      const conflictStart = new Date(conflict.startDate).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      const conflictEnd = conflict.endDate 
        ? new Date(conflict.endDate).toLocaleString('en-US', { timeStyle: 'short' })
        : 'end time not specified';
      
      return res.status(409).json({ 
        error: 'Event conflict detected',
        message: `This location is already booked for "${conflict.title}" by ${conflict.community.name} from ${conflictStart} to ${conflictEnd}. Please choose a different time or location.`,
        conflictingEvent: {
          id: conflict.id,
          title: conflict.title,
          community: conflict.community.name,
          startDate: conflict.startDate,
          endDate: conflict.endDate,
          location: conflict.location
        }
      });
    }

    // Create event with approval workflow
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location: locationDisplay,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        communityId,
        collegeId: community.collegeId,
        locationId,
        createdBy: req.user.id,
        status: 'PENDING_FACULTY_APPROVAL',
        facultyLeaderApproval: 'PENDING',
        deanOfFacultyApproval: 'PENDING',
        deanshipApproval: 'PENDING'
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
        },
        college: true
      }
    });

    // Send notification to Faculty Leader of this college
    const facultyLeader = await prisma.user.findFirst({
      where: {
        role: 'FACULTY_LEADER',
        collegeId: community.collegeId
      }
    });

    if (facultyLeader) {
      await prisma.notification.create({
        data: {
          userId: facultyLeader.id,
          eventId: event.id,
          type: 'EVENT_PENDING_APPROVAL',
          message: `New event "${title}" is pending your approval from ${community.name}`
        }
      });
    }

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

// Faculty Leader Approval
export const facultyApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, reason } = req.body;
    const user = req.user;

    // Verify user is Faculty Leader
    if (user.role !== 'FACULTY_LEADER') {
      return res.status(403).json({ error: 'Only Faculty Leaders can approve at this stage' });
    }

    // Get event with college
    const event = await prisma.event.findUnique({
      where: { id },
      include: { college: true, community: true }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify Faculty Leader belongs to the same college
    if (event.collegeId !== user.collegeId) {
      return res.status(403).json({ error: 'You can only approve events from your college' });
    }

    if (approved) {
      // Approve and move to next stage
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          facultyLeaderApproval: 'APPROVED',
          facultyLeaderApprovedBy: user.id,
          facultyLeaderApprovedAt: new Date(),
          status: 'PENDING_DEAN_APPROVAL'
        }
      });

      // Notify Dean of Faculty
      const dean = await prisma.user.findFirst({
        where: {
          role: 'DEAN_OF_FACULTY',
          collegeId: event.collegeId
        }
      });

      if (dean) {
        await prisma.notification.create({
          data: {
            userId: dean.id,
            eventId: event.id,
            type: 'EVENT_PENDING_APPROVAL',
            message: `Event "${event.title}" has been approved by Faculty Leader and is pending your approval`
          }
        });
      }

      res.json({ event: updatedEvent, message: 'Event approved and forwarded to Dean of Faculty' });
    } else {
      // Reject
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          facultyLeaderApproval: 'REJECTED',
          facultyLeaderApprovedBy: user.id,
          facultyLeaderApprovedAt: new Date(),
          facultyLeaderRejectionReason: reason || 'No reason provided',
          status: 'REJECTED'
        }
      });

      // Notify event creator
      await prisma.notification.create({
        data: {
          userId: event.createdBy,
          eventId: event.id,
          type: 'EVENT_REJECTED',
          message: `Your event "${event.title}" was rejected by Faculty Leader${reason ? `: ${reason}` : ''}`
        }
      });

      res.json({ event: updatedEvent, message: 'Event rejected' });
    }
  } catch (error) {
    console.error('Faculty approval error:', error);
    res.status(500).json({ error: 'Failed to process approval' });
  }
};

// Dean of Faculty Approval
export const deanApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, reason } = req.body;
    const user = req.user;

    // Verify user is Dean of Faculty
    if (user.role !== 'DEAN_OF_FACULTY') {
      return res.status(403).json({ error: 'Only Dean of Faculty can approve at this stage' });
    }

    // Get event
    const event = await prisma.event.findUnique({
      where: { id },
      include: { college: true }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify Dean belongs to the same college
    if (event.collegeId !== user.collegeId) {
      return res.status(403).json({ error: 'You can only approve events from your college' });
    }

    // Verify Faculty Leader has approved
    if (event.facultyLeaderApproval !== 'APPROVED') {
      return res.status(400).json({ error: 'Event must be approved by Faculty Leader first' });
    }

    if (approved) {
      // Approve and move to final stage
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          deanOfFacultyApproval: 'APPROVED',
          deanOfFacultyApprovedBy: user.id,
          deanOfFacultyApprovedAt: new Date(),
          status: 'PENDING_DEANSHIP_APPROVAL'
        }
      });

      // Notify Deanship of Student Affairs
      const deanship = await prisma.user.findFirst({
        where: {
          role: 'DEANSHIP_OF_STUDENT_AFFAIRS'
        }
      });

      if (deanship) {
        await prisma.notification.create({
          data: {
            userId: deanship.id,
            eventId: event.id,
            type: 'EVENT_PENDING_APPROVAL',
            message: `Event "${event.title}" from ${event.college.name} is pending your final approval`
          }
        });
      }

      res.json({ event: updatedEvent, message: 'Event approved and forwarded to Deanship of Student Affairs' });
    } else {
      // Reject
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          deanOfFacultyApproval: 'REJECTED',
          deanOfFacultyApprovedBy: user.id,
          deanOfFacultyApprovedAt: new Date(),
          deanOfFacultyRejectionReason: reason || 'No reason provided',
          status: 'REJECTED'
        }
      });

      // Notify event creator
      await prisma.notification.create({
        data: {
          userId: event.createdBy,
          eventId: event.id,
          type: 'EVENT_REJECTED',
          message: `Your event "${event.title}" was rejected by Dean of Faculty${reason ? `: ${reason}` : ''}`
        }
      });

      res.json({ event: updatedEvent, message: 'Event rejected' });
    }
  } catch (error) {
    console.error('Dean approval error:', error);
    res.status(500).json({ error: 'Failed to process approval' });
  }
};

// Deanship of Student Affairs Approval (Final)
export const deanshipApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, reason } = req.body;
    const user = req.user;

    // Verify user is Deanship
    if (user.role !== 'DEANSHIP_OF_STUDENT_AFFAIRS') {
      return res.status(403).json({ error: 'Only Deanship of Student Affairs can approve at this stage' });
    }

    // Get event
    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify previous approvals
    if (event.facultyLeaderApproval !== 'APPROVED' || event.deanOfFacultyApproval !== 'APPROVED') {
      return res.status(400).json({ error: 'Event must be approved by Faculty Leader and Dean first' });
    }

    if (approved) {
      // Final approval
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          deanshipApproval: 'APPROVED',
          deanshipApprovedBy: user.id,
          deanshipApprovedAt: new Date(),
          status: 'APPROVED'
        }
      });

      // Notify event creator
      await prisma.notification.create({
        data: {
          userId: event.createdBy,
          eventId: event.id,
          type: 'EVENT_APPROVED',
          message: `Congratulations! Your event "${event.title}" has been fully approved and is now published`
        }
      });

      res.json({ event: updatedEvent, message: 'Event fully approved and published' });
    } else {
      // Reject
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          deanshipApproval: 'REJECTED',
          deanshipApprovedBy: user.id,
          deanshipApprovedAt: new Date(),
          deanshipRejectionReason: reason || 'No reason provided',
          status: 'REJECTED'
        }
      });

      // Notify event creator
      await prisma.notification.create({
        data: {
          userId: event.createdBy,
          eventId: event.id,
          type: 'EVENT_REJECTED',
          message: `Your event "${event.title}" was rejected by Deanship of Student Affairs${reason ? `: ${reason}` : ''}`
        }
      });

      res.json({ event: updatedEvent, message: 'Event rejected' });
    }
  } catch (error) {
    console.error('Deanship approval error:', error);
    res.status(500).json({ error: 'Failed to process approval' });
  }
};

// Get events pending approval for current user
export const getPendingApprovals = async (req, res) => {
  try {
    const user = req.user;
    let where = {};

    if (user.role === 'FACULTY_LEADER') {
      where = {
        collegeId: user.collegeId,
        status: 'PENDING_FACULTY_APPROVAL'
      };
    } else if (user.role === 'DEAN_OF_FACULTY') {
      where = {
        collegeId: user.collegeId,
        status: 'PENDING_DEAN_APPROVAL'
      };
    } else if (user.role === 'DEANSHIP_OF_STUDENT_AFFAIRS') {
      where = {
        status: 'PENDING_DEANSHIP_APPROVAL'
      };
    } else {
      return res.json({ events: [] });
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
        },
        college: true,
        eventLocation: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ events });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
};
