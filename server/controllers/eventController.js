import prisma from '../utils/prisma.js';
import Profiler from '../utils/profiler.js';

// Cache for frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function setCache(key, value) {
  cache.set(key, { value, timestamp: Date.now() });
}

function getCache(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }
  cache.delete(key);
  return null;
}

export const getAllEvents = async (req, res) => {
  try {
    const { search, communityId, upcoming } = req.query;

    // Build where clause - show approved events OR events created by the authenticated user
    const where = {};
    
    // If user is authenticated, show approved events OR their own events (regardless of status)
    if (req.user) {
      where.OR = [
        { status: 'APPROVED' },
        { createdBy: req.user.id } // Include user's own events
      ];
    } else {
      // For public access, only show approved events
      where.status = 'APPROVED';
    }
    
    if (search) {
      const searchConditions = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
      
      // Combine with existing OR conditions if user is authenticated
      if (req.user) {
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions }
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    if (communityId) {
      where.communityId = communityId;
    }

    if (upcoming === 'true') {
      where.startDate = {
        gte: new Date()
      };
    }

    // Optimize query - select only needed fields
    const events = await prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        status: true,
        capacity: true,
        createdBy: true,
        facultyLeaderApproval: true,
        deanOfFacultyApproval: true,
        deanshipApproval: true,
        deanOfFacultyRevisionMessage: true,
        facultyLeaderRevisionResponse: true,
        deanshipRevisionMessage: true,
        deanOfFacultyRevisionResponse: true,
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
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { startDate: 'asc' },
      take: 100 // Limit results for better performance
    });

    // Set cache headers based on user context
    if (req.user) {
      // For authenticated users showing their own events: short cache (30 seconds)
      // This allows approval status to update relatively quickly
      res.set('Cache-Control', 'private, max-age=30');
    } else {
      // For public approved events: longer cache (5 minutes)
      res.set('Cache-Control', 'public, max-age=300');
    }
    
    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check cache first
    const cacheKey = `event_${id}`;
    const cachedEvent = getCache(cacheKey);
    if (cachedEvent) {
      res.set('X-Cache', 'HIT');
      return res.json({ event: cachedEvent });
    }

    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        status: true,
        capacity: true,
        createdAt: true,
        updatedAt: true,
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
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Cache the result
    setCache(cacheKey, event);
    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const createEvent = async (req, res) => {
  const profiler = new Profiler('Create Event');
  
  try {
    let { title, description, collegeId, locationId, startDate, endDate, communityId } = req.body;

    // Validate input
    if (!title || !description || !locationId || !startDate) {
      return res.status(400).json({ error: 'Required fields: title, description, locationId, startDate' });
    }

    // For club leaders, automatically get their community and college
    if (req.user.role === 'CLUB_LEADER') {
      // Find the community that this club leader leads
      const ledCommunity = await prisma.community.findFirst({
        where: {
          clubLeaderId: req.user.id
        },
        include: { college: true }
      });

      if (!ledCommunity) {
        return res.status(403).json({ 
          error: 'No community assigned',
          message: 'You are not assigned as a leader of any community. Please contact an admin.' 
        });
      }

      if (!ledCommunity.collegeId) {
        return res.status(400).json({ 
          error: 'Community not linked to a college',
          message: 'Your community must be assigned to a college. Please contact an admin.' 
        });
      }

      // Automatically set the community and college
      communityId = ledCommunity.id;
      collegeId = ledCommunity.collegeId;

      console.log(`✅ Auto-assigned event to club leader ${req.user.firstName} ${req.user.lastName}:`, {
        community: ledCommunity.name,
        college: ledCommunity.college?.name
      });
    } else {
      // For non-club leaders, communityId is required
      if (!communityId) {
        return res.status(400).json({ error: 'Required field: communityId' });
      }
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
    profiler.start('create_event_transaction');
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
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        status: true,
        capacity: true,
        createdBy: true,
        facultyLeaderApproval: true,
        deanOfFacultyApproval: true,
        deanshipApproval: true,
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
        college: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });
    profiler.end('create_event_transaction');

    // Send notification to ALL Faculty Leaders of this college
    profiler.start('create_notification');
    const facultyLeaders = await prisma.user.findMany({
      where: {
        role: 'FACULTY_LEADER',
        collegeId: community.collegeId
      },
      select: { id: true, firstName: true, lastName: true }
    });

    if (facultyLeaders.length > 0) {
      console.log(`📧 Sending new event notification to ${facultyLeaders.length} faculty leader(s) for college ${community.collegeId}`);
      for (const facultyLeader of facultyLeaders) {
        await prisma.notification.create({
          data: {
            userId: facultyLeader.id,
            eventId: event.id,
            type: 'EVENT_PENDING_APPROVAL',
            message: `New event "${title}" is pending your approval from ${community.name}`
          }
        });
        console.log(`   ✅ Notified: ${facultyLeader.firstName} ${facultyLeader.lastName}`);
      }
    } else {
      console.log(`⚠️  No Faculty Leader found for college ${community.collegeId}`);
    }
    profiler.end('create_notification');

    profiler.log();
    res.status(201).json({ event });
  } catch (error) {
    console.error('Create event error:', error);
    profiler.log();
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

// Faculty Leader Approval - OPTIMIZED
export const facultyApproval = async (req, res) => {
  const profiler = new Profiler('Faculty Approval');
  
  try {
    const { id } = req.params;
    const { approved, reason } = req.body;
    const user = req.user;

    // Verify user is Faculty Leader
    if (user.role !== 'FACULTY_LEADER') {
      return res.status(403).json({ error: 'Only Faculty Leaders can approve at this stage' });
    }

    profiler.start('fetch_event');
    // Optimized: Use select instead of include to reduce payload
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        collegeId: true,
        createdBy: true,
        status: true,
        facultyLeaderApproval: true
      }
    });
    profiler.end('fetch_event');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify Faculty Leader belongs to the same college
    if (event.collegeId !== user.collegeId) {
      return res.status(403).json({ error: 'You can only approve events from your college' });
    }

    if (approved) {
      profiler.start('approval_transaction');
      // Optimized: Use transaction to combine update + notification lookup + notification creation
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update event
        const updatedEvent = await tx.event.update({
          where: { id },
          data: {
            facultyLeaderApproval: 'APPROVED',
            facultyLeaderApprovedBy: user.id,
            facultyLeaderApprovedAt: new Date(),
            status: 'PENDING_DEAN_APPROVAL'
          },
          select: {
            id: true,
            title: true,
            status: true,
            facultyLeaderApproval: true,
            facultyLeaderApprovedBy: true,
            facultyLeaderApprovedAt: true
          }
        });

        // 2. Find ALL deans for this college and create notifications
        const deans = await tx.user.findMany({
          where: {
            role: 'DEAN_OF_FACULTY',
            collegeId: event.collegeId
          },
          select: { id: true, firstName: true, lastName: true } // Select what we need for logging
        });

        // 3. Create notification for EACH dean
        if (deans.length > 0) {
          console.log(`📧 Sending notification to ${deans.length} dean(s) for college ${event.collegeId}`);
          for (const dean of deans) {
            await tx.notification.create({
              data: {
                userId: dean.id,
                eventId: event.id,
                type: 'EVENT_PENDING_APPROVAL',
                message: `Event "${event.title}" has been approved by Faculty Leader and is pending your approval`
              }
            });
            console.log(`   ✅ Notified: ${dean.firstName} ${dean.lastName}`);
          }
        } else {
          console.log(`⚠️  No Dean of Faculty found for college ${event.collegeId}`);
        }

        return updatedEvent;
      });
      profiler.end('approval_transaction');

      profiler.log();
      res.json({ event: result, message: 'Event approved and forwarded to Dean of Faculty' });
    } else {
      profiler.start('revision_transaction');
      // Send back for revision instead of rejecting
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update event - use facultyLeaderRejectionReason for revision message
        const updatedEvent = await tx.event.update({
          where: { id },
          data: {
            facultyLeaderApproval: 'PENDING',
            facultyLeaderApprovedBy: user.id,
            facultyLeaderApprovedAt: new Date(),
            facultyLeaderRejectionReason: reason || 'Please revise your event',
            status: 'PENDING_FACULTY_APPROVAL'
          },
          select: {
            id: true,
            title: true,
            status: true,
            facultyLeaderApproval: true,
            facultyLeaderApprovedBy: true,
            facultyLeaderApprovedAt: true,
            facultyLeaderRejectionReason: true
          }
        });

        // 2. Notify club leader (event creator) for revision
        await tx.notification.create({
          data: {
            userId: event.createdBy,
            eventId: event.id,
            type: 'EVENT_NEEDS_REVISION',
            message: `The Faculty Leader requests revision for event "${event.title}": ${reason || 'Please revise your event'}`
          }
        });

        return updatedEvent;
      });
      profiler.end('revision_transaction');

      profiler.log();
      res.json({ event: result, message: 'Event sent back for revision' });
    }
  } catch (error) {
    console.error('Faculty approval error:', error);
    profiler.log();
    res.status(500).json({ error: 'Failed to process approval' });
  }
};

// Faculty Leader Permanent Rejection
export const facultyReject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;

    if (user.role !== 'FACULTY_LEADER') {
      return res.status(403).json({ error: 'Only Faculty Leaders can reject at this stage' });
    }

    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        collegeId: true,
        createdBy: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.collegeId !== user.collegeId) {
      return res.status(403).json({ error: 'You can only reject events from your college' });
    }

    // Permanently reject the event
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

    // Notify event creator (Club Leader)
    await prisma.notification.create({
      data: {
        userId: event.createdBy,
        eventId: event.id,
        type: 'EVENT_REJECTED',
        message: `Your event "${event.title}" was rejected by Faculty Leader${reason ? `: ${reason}` : ''}`
      }
    });

    res.json({ event: updatedEvent, message: 'Event permanently rejected' });
  } catch (error) {
    console.error('Faculty rejection error:', error);
    res.status(500).json({ error: 'Failed to reject event' });
  }
};

// Dean of Faculty Approval - OPTIMIZED
export const deanApproval = async (req, res) => {
  const profiler = new Profiler('Dean Approval');
  
  try {
    const { id } = req.params;
    const { approved, reason } = req.body;
    const user = req.user;

    // Verify user is Dean of Faculty
    if (user.role !== 'DEAN_OF_FACULTY') {
      return res.status(403).json({ error: 'Only Dean of Faculty can approve at this stage' });
    }

    profiler.start('fetch_event');
    // Optimized: Use select instead of include
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        collegeId: true,
        createdBy: true,
        status: true,
        facultyLeaderApproval: true,
        deanOfFacultyApproval: true,
        college: {
          select: { name: true } // Only get college name for notification
        }
      }
    });
    profiler.end('fetch_event');

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
      profiler.start('approval_transaction');
      // Optimized: Use transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update event
        const updatedEvent = await tx.event.update({
          where: { id },
          data: {
            deanOfFacultyApproval: 'APPROVED',
            deanOfFacultyApprovedBy: user.id,
            deanOfFacultyApprovedAt: new Date(),
            status: 'PENDING_DEANSHIP_APPROVAL'
          },
          select: {
            id: true,
            title: true,
            status: true,
            deanOfFacultyApproval: true,
            deanOfFacultyApprovedBy: true,
            deanOfFacultyApprovedAt: true
          }
        });

        // 2. Find ALL deanship users and create notifications
        const deanships = await tx.user.findMany({
          where: {
            role: 'DEANSHIP_OF_STUDENT_AFFAIRS'
          },
          select: { id: true, firstName: true, lastName: true }
        });

        if (deanships.length > 0) {
          console.log(`📧 Sending approval notification to ${deanships.length} deanship user(s)`);
          for (const deanship of deanships) {
            await tx.notification.create({
              data: {
                userId: deanship.id,
                eventId: event.id,
                type: 'EVENT_PENDING_APPROVAL',
                message: `Event "${event.title}" from ${event.college.name} is pending your final approval`
              }
            });
            console.log(`   ✅ Notified: ${deanship.firstName} ${deanship.lastName}`);
          }
        } else {
          console.log(`⚠️  No Deanship user found`);
        }

        return updatedEvent;
      });
      profiler.end('approval_transaction');

      profiler.log();
      res.json({ event: result, message: 'Event approved and forwarded to Deanship of Student Affairs' });
    } else {
      profiler.start('revision_transaction');
      // Send back for revision instead of rejecting
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update event
        const updatedEvent = await tx.event.update({
          where: { id },
          data: {
            deanOfFacultyApproval: 'PENDING',
            deanOfFacultyApprovedBy: user.id,
            deanOfFacultyApprovedAt: new Date(),
            deanOfFacultyRevisionMessage: reason || 'Please revise your event',
            facultyLeaderRevisionResponse: null, // Clear previous response
            status: 'NEEDS_REVISION_DEAN'
          },
          select: {
            id: true,
            title: true,
            status: true,
            deanOfFacultyApproval: true,
            deanOfFacultyApprovedBy: true,
            deanOfFacultyApprovedAt: true,
            deanOfFacultyRevisionMessage: true
          }
        });

        // 2. Notify ALL faculty leaders for revision
        const facultyLeaders = await tx.user.findMany({
          where: {
            role: 'FACULTY_LEADER',
            collegeId: event.collegeId
          },
          select: { id: true, firstName: true, lastName: true }
        });

        if (facultyLeaders.length > 0) {
          console.log(`📧 Sending dean revision request to ${facultyLeaders.length} faculty leader(s) for college ${event.collegeId}`);
          for (const facultyLeader of facultyLeaders) {
            await tx.notification.create({
              data: {
                userId: facultyLeader.id,
                eventId: event.id,
                type: 'EVENT_NEEDS_REVISION',
                message: `The Dean of Faculty requests revision for event "${event.title}": ${reason || 'Please revise your event'}`
              }
            });
            console.log(`   ✅ Notified: ${facultyLeader.firstName} ${facultyLeader.lastName}`);
          }
        } else {
          console.log(`⚠️  No Faculty Leader found for college ${event.collegeId}`);
        }

        return updatedEvent;
      });
      profiler.end('revision_transaction');

      profiler.log();
      res.json({ event: result, message: 'Event sent back for revision' });
    }
  } catch (error) {
    console.error('Dean approval error:', error);
    profiler.log();
    res.status(500).json({ error: 'Failed to process approval' });
  }
};

// Dean of Faculty Permanent Rejection
export const deanReject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;

    if (user.role !== 'DEAN_OF_FACULTY') {
      return res.status(403).json({ error: 'Only Dean of Faculty can reject at this stage' });
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: { college: true }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.collegeId !== user.collegeId) {
      return res.status(403).json({ error: 'You can only reject events from your college' });
    }

    // Permanently reject the event
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

    res.json({ event: updatedEvent, message: 'Event permanently rejected' });
  } catch (error) {
    console.error('Dean rejection error:', error);
    res.status(500).json({ error: 'Failed to reject event' });
  }
};

// Deanship of Student Affairs Approval (Final) - OPTIMIZED
export const deanshipApproval = async (req, res) => {
  const profiler = new Profiler('Deanship Approval');
  
  try {
    const { id } = req.params;
    const { approved, reason } = req.body;
    const user = req.user;

    // Verify user is Deanship
    if (user.role !== 'DEANSHIP_OF_STUDENT_AFFAIRS') {
      return res.status(403).json({ error: 'Only Deanship of Student Affairs can approve at this stage' });
    }

    profiler.start('fetch_event');
    // Optimized: Use select instead of full fetch
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        collegeId: true,
        createdBy: true,
        status: true,
        facultyLeaderApproval: true,
        deanOfFacultyApproval: true,
        deanshipApproval: true
      }
    });
    profiler.end('fetch_event');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify previous approvals
    if (event.facultyLeaderApproval !== 'APPROVED' || event.deanOfFacultyApproval !== 'APPROVED') {
      return res.status(400).json({ error: 'Event must be approved by Faculty Leader and Dean first' });
    }

    if (approved) {
      profiler.start('approval_transaction');
      // Optimized: Use transaction for final approval
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update event
        const updatedEvent = await tx.event.update({
          where: { id },
          data: {
            deanshipApproval: 'APPROVED',
            deanshipApprovedBy: user.id,
            deanshipApprovedAt: new Date(),
            status: 'APPROVED'
          },
          select: {
            id: true,
            title: true,
            status: true,
            deanshipApproval: true,
            deanshipApprovedBy: true,
            deanshipApprovedAt: true
          }
        });

        // 2. Notify event creator
        await tx.notification.create({
          data: {
            userId: event.createdBy,
            eventId: event.id,
            type: 'EVENT_APPROVED',
            message: `Congratulations! Your event "${event.title}" has been fully approved and is now published`
          }
        });

        return updatedEvent;
      });
      profiler.end('approval_transaction');

      profiler.log();
      res.json({ event: result, message: 'Event fully approved and published' });
    } else {
      profiler.start('revision_transaction');
      // Send back for revision instead of rejecting
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update event
        const updatedEvent = await tx.event.update({
          where: { id },
          data: {
            deanshipApproval: 'PENDING',
            deanshipApprovedBy: user.id,
            deanshipApprovedAt: new Date(),
            deanshipRevisionMessage: reason || 'Please revise your event',
            deanOfFacultyRevisionResponse: null, // Clear previous response
            status: 'NEEDS_REVISION_DEANSHIP'
          },
          select: {
            id: true,
            title: true,
            status: true,
            deanshipApproval: true,
            deanshipApprovedBy: true,
            deanshipApprovedAt: true,
            deanshipRevisionMessage: true
          }
        });

        // 2. Notify ALL Deans of Faculty for revision
        const deans = await tx.user.findMany({
          where: {
            role: 'DEAN_OF_FACULTY',
            collegeId: event.collegeId
          },
          select: { id: true, firstName: true, lastName: true }
        });

        if (deans.length > 0) {
          console.log(`📧 Sending deanship revision request to ${deans.length} dean(s) for college ${event.collegeId}`);
          for (const dean of deans) {
            await tx.notification.create({
              data: {
                userId: dean.id,
                eventId: event.id,
                type: 'EVENT_NEEDS_REVISION',
                message: `The Deanship of Student Affairs requests revision for event "${event.title}": ${reason || 'Please revise your event'}`
              }
            });
            console.log(`   ✅ Notified: ${dean.firstName} ${dean.lastName}`);
          }
        } else {
          console.log(`⚠️  No Dean of Faculty found for college ${event.collegeId}`);
        }

        return updatedEvent;
      });
      profiler.end('revision_transaction');

      profiler.log();
      res.json({ event: result, message: 'Event sent back for revision' });
    }
  } catch (error) {
    console.error('Deanship approval error:', error);
    profiler.log();
    res.status(500).json({ error: 'Failed to process approval' });
  }
};

// Deanship Permanent Rejection
export const deanshipReject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;

    if (user.role !== 'DEANSHIP_OF_STUDENT_AFFAIRS') {
      return res.status(403).json({ error: 'Only Deanship of Student Affairs can reject at this stage' });
    }

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Permanently reject the event
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

    res.json({ event: updatedEvent, message: 'Event permanently rejected' });
  } catch (error) {
    console.error('Deanship rejection error:', error);
    res.status(500).json({ error: 'Failed to reject event' });
  }
};

// Club Leader, Faculty Leader or Dean of Faculty responds to revision request and resubmits
export const respondToRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const user = req.user;

    // Verify user is Club Leader, Faculty Leader or Dean of Faculty
    if (user.role !== 'CLUB_LEADER' && user.role !== 'FACULTY_LEADER' && user.role !== 'DEAN_OF_FACULTY') {
      return res.status(403).json({ error: 'Only Club Leaders, Faculty Leaders and Dean of Faculty can respond to revision requests' });
    }

    // Get event
    const event = await prisma.event.findUnique({
      where: { id },
      include: { college: true }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify user is event creator for Club Leader role
    if (user.role === 'CLUB_LEADER' && event.createdBy !== user.id) {
      return res.status(403).json({ error: 'You can only respond to your own events' });
    }

    // Verify user belongs to the same college for Faculty/Dean roles
    if ((user.role === 'FACULTY_LEADER' || user.role === 'DEAN_OF_FACULTY') && event.collegeId !== user.collegeId) {
      return res.status(403).json({ error: 'You can only respond to events from your college' });
    }

    // Verify event is in revision status
    const validStatuses = ['NEEDS_REVISION_DEAN', 'NEEDS_REVISION_DEANSHIP', 'PENDING_FACULTY_APPROVAL'];
    if (!validStatuses.includes(event.status)) {
      return res.status(400).json({ error: 'Event is not awaiting revision' });
    }

    if (!response || response.trim() === '') {
      return res.status(400).json({ error: 'Please provide a response' });
    }

    let updatedEvent;
    
    // If Club Leader responding to Faculty Leader's revision
    if (user.role === 'CLUB_LEADER' && event.status === 'PENDING_FACULTY_APPROVAL') {
      // Keep the original revision reason and append the response
      const originalReason = event.facultyLeaderRejectionReason || '';
      const combinedMessage = `${originalReason}\n\n📝 Club Leader Response: ${response}`;
      
      // Update event - store both revision reason and response
      updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          facultyLeaderApproval: 'PENDING',
          facultyLeaderRejectionReason: combinedMessage,
          status: 'PENDING_FACULTY_APPROVAL'
        }
      });

      // Notify ALL Faculty Leaders about the resubmission
      const facultyLeaders = await prisma.user.findMany({
        where: {
          role: 'FACULTY_LEADER',
          collegeId: event.collegeId
        },
        select: { id: true, firstName: true, lastName: true }
      });

      if (facultyLeaders.length > 0) {
        console.log(`📧 Sending club leader revision response to ${facultyLeaders.length} faculty leader(s) for college ${event.collegeId}`);
        for (const facultyLeader of facultyLeaders) {
          await prisma.notification.create({
            data: {
              userId: facultyLeader.id,
              eventId: event.id,
              type: 'EVENT_PENDING_APPROVAL',
              message: `${user.name} has responded to your revision request for event "${event.title}" and resubmitted it for your review. Response: ${response}`
            }
          });
          console.log(`   ✅ Notified: ${facultyLeader.firstName} ${facultyLeader.lastName}`);
        }
      } else {
        console.log(`⚠️  No Faculty Leader found for college ${event.collegeId}`);
      }
      
      // Also notify the Club Leader confirming their response was submitted
      await prisma.notification.create({
        data: {
          userId: user.id,
          eventId: event.id,
          type: 'EVENT_PENDING_APPROVAL',
          message: `Your response to the revision request for event "${event.title}" has been submitted to Faculty Leader. Original Request: ${originalReason}\n\n${user.name}'s Response: ${response}`
        }
      });
    }
    // If Faculty Leader responding to Dean's revision
    else if (user.role === 'FACULTY_LEADER' && event.status === 'NEEDS_REVISION_DEAN') {
      // Update event with faculty leader's response and resubmit to dean
      updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          facultyLeaderRevisionResponse: response,
          status: 'PENDING_DEAN_APPROVAL'
        }
      });

      // Notify ALL Deans of Faculty about the revision response
      const deans = await prisma.user.findMany({
        where: {
          role: 'DEAN_OF_FACULTY',
          collegeId: event.collegeId
        },
        select: { id: true, firstName: true, lastName: true }
      });

      if (deans.length > 0) {
        console.log(`📧 Sending revision response notification to ${deans.length} dean(s) for college ${event.collegeId}`);
        for (const dean of deans) {
          await prisma.notification.create({
            data: {
              userId: dean.id,
              eventId: event.id,
              type: 'EVENT_PENDING_APPROVAL',
              message: `Faculty Leader has responded to your revision request for event "${event.title}" and resubmitted it for your review. Response: ${response}`
            }
          });
          console.log(`   ✅ Notified: ${dean.firstName} ${dean.lastName}`);
        }
      } else {
        console.log(`⚠️  No Dean of Faculty found for college ${event.collegeId}`);
      }
    }
    // If Dean of Faculty responding to Deanship's revision
    else if (user.role === 'DEAN_OF_FACULTY' && event.status === 'NEEDS_REVISION_DEANSHIP') {
      // Update event with dean's response and resubmit to deanship
      updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          deanOfFacultyRevisionResponse: response,
          status: 'PENDING_DEANSHIP_APPROVAL'
        }
      });

      // Notify ALL Deanship users about the revision response
      const deanships = await prisma.user.findMany({
        where: {
          role: 'DEANSHIP_OF_STUDENT_AFFAIRS'
        },
        select: { id: true, firstName: true, lastName: true }
      });

      if (deanships.length > 0) {
        console.log(`📧 Sending dean revision response to ${deanships.length} deanship user(s)`);
        for (const deanship of deanships) {
          await prisma.notification.create({
            data: {
              userId: deanship.id,
              eventId: event.id,
              type: 'EVENT_PENDING_APPROVAL',
              message: `Dean of Faculty has responded to your revision request for event "${event.title}" and resubmitted it for your review. Response: ${response}`
            }
          });
          console.log(`   ✅ Notified: ${deanship.firstName} ${deanship.lastName}`);
        }
      } else {
        console.log(`⚠️  No Deanship user found`);
      }
    }
    else {
      return res.status(403).json({ error: 'Invalid role or status for this revision' });
    }

    res.json({ event: updatedEvent, message: 'Response sent and event resubmitted' });
  } catch (error) {
    console.error('Respond to revision error:', error);
    res.status(500).json({ error: 'Failed to respond to revision request' });
  }
};

// Dean of Faculty responds to Deanship's revision request and resubmits
export const respondToDeanshipRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const user = req.user;

    // Verify user is Dean of Faculty
    if (user.role !== 'DEAN_OF_FACULTY') {
      return res.status(403).json({ error: 'Only Dean of Faculty can respond to deanship revision requests' });
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
      return res.status(403).json({ error: 'You can only respond to events from your college' });
    }

    // Verify event is in deanship revision status
    if (event.status !== 'NEEDS_REVISION_DEANSHIP') {
      return res.status(400).json({ error: 'Event is not awaiting deanship revision' });
    }

    if (!response || response.trim() === '') {
      return res.status(400).json({ error: 'Please provide a response to the deanship' });
    }

    // Update event with dean's response and resubmit to deanship
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        deanOfFacultyRevisionResponse: response,
        status: 'PENDING_DEANSHIP_APPROVAL'
      }
    });

    // Notify ALL Deanship users about the revision response
    const deanships = await prisma.user.findMany({
      where: {
        role: 'DEANSHIP_OF_STUDENT_AFFAIRS'
      },
      select: { id: true, firstName: true, lastName: true }
    });

    if (deanships.length > 0) {
      console.log(`📧 Sending dean revision response to ${deanships.length} deanship user(s)`);
      for (const deanship of deanships) {
        await prisma.notification.create({
          data: {
            userId: deanship.id,
            eventId: event.id,
            type: 'EVENT_PENDING_APPROVAL',
            message: `Dean of Faculty has responded to your revision request for event "${event.title}" and resubmitted it for your review. Response: ${response}`
          }
        });
        console.log(`   ✅ Notified: ${deanship.firstName} ${deanship.lastName}`);
      }
    } else {
      console.log(`⚠️  No Deanship user found`);
    }

    res.json({ event: updatedEvent, message: 'Response sent and event resubmitted to Deanship' });
  } catch (error) {
    console.error('Respond to deanship revision error:', error);
    res.status(500).json({ error: 'Failed to respond to deanship revision request' });
  }
};

// Get events pending approval for current user - OPTIMIZED
export const getPendingApprovals = async (req, res) => {
  const profiler = new Profiler('Get Pending Approvals');
  
  try {
    const user = req.user;
    let where = {};

    if (user.role === 'FACULTY_LEADER') {
      where = {
        collegeId: user.collegeId,
        status: {
          in: ['PENDING_FACULTY_APPROVAL', 'NEEDS_REVISION_DEAN']
        }
      };
    } else if (user.role === 'DEAN_OF_FACULTY') {
      where = {
        collegeId: user.collegeId,
        status: {
          in: ['PENDING_DEAN_APPROVAL', 'NEEDS_REVISION_DEANSHIP']
        }
      };
    } else if (user.role === 'DEANSHIP_OF_STUDENT_AFFAIRS') {
      where = {
        status: 'PENDING_DEANSHIP_APPROVAL'
      };
    } else {
      return res.json({ events: [] });
    }

    profiler.start('fetch_pending_events');
    // OPTIMIZED: Use select instead of include to reduce payload size
    const events = await prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        status: true,
        capacity: true,
        createdBy: true,
        createdAt: true,
        facultyLeaderApproval: true,
        deanOfFacultyApproval: true,
        deanshipApproval: true,
        deanOfFacultyRevisionMessage: true,
        facultyLeaderRevisionResponse: true,
        deanshipRevisionMessage: true,
        deanOfFacultyRevisionResponse: true,
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
        college: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        eventLocation: {
          select: {
            id: true,
            name: true,
            capacity: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    profiler.end('fetch_pending_events');

    profiler.log();
    
    // Don't cache pending approvals - needs to be fresh
    res.set('Cache-Control', 'no-store');
    res.json({ events });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    profiler.log();
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
};
