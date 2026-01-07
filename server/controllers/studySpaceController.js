import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get all study spaces with current availability
export const getAllStudySpaces = async (req, res) => {
  try {
    const { date } = req.query;
    
    // Use UTC to avoid timezone issues
    let targetDate;
    if (date) {
      targetDate = new Date(date + 'T00:00:00.000Z');
    } else {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-CA');
      targetDate = new Date(dateStr + 'T00:00:00.000Z');
    }
    
    console.log('Getting all spaces for date:', targetDate.toISOString());

    const spaces = await prisma.studySpace.findMany({
      orderBy: { name: 'asc' }
    });

    // Get current reservation counts for each space
    const spacesWithAvailability = await Promise.all(
      spaces.map(async (space) => {
        const reservationCount = await prisma.studySpaceReservation.count({
          where: {
            spaceId: space.id,
            date: targetDate,
            status: 'ACTIVE'
          }
        });
        
        console.log(`Space ${space.name}: ${reservationCount} reservations`);

        const availableSeats = space.capacity - reservationCount;
        const percentFull = (reservationCount / space.capacity) * 100;

        let availability = 'Available';
        if (availableSeats === 0) {
          availability = 'Full';
        } else if (percentFull >= 80) {
          availability = 'Busy';
        }

        return {
          ...space,
          currentReservations: reservationCount,
          availableSeats,
          availability
        };
      })
    );

    res.json(spacesWithAvailability);
  } catch (error) {
    console.error('Error fetching study spaces:', error);
    res.status(500).json({ error: 'Failed to fetch study spaces' });
  }
};

// Get a single study space with availability
export const getStudySpace = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    // Use UTC to avoid timezone issues
    let targetDate;
    if (date) {
      targetDate = new Date(date + 'T00:00:00.000Z');
    } else {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-CA');
      targetDate = new Date(dateStr + 'T00:00:00.000Z');
    }

    const space = await prisma.studySpace.findUnique({
      where: { id }
    });

    if (!space) {
      return res.status(404).json({ error: 'Study space not found' });
    }

    const reservationCount = await prisma.studySpaceReservation.count({
      where: {
        spaceId: id,
        date: targetDate,
        status: 'ACTIVE'
      }
    });
    
    console.log(`Space ${id} - Date: ${targetDate.toISOString()}, Reservations: ${reservationCount}`);

    const availableSeats = space.capacity - reservationCount;
    const percentFull = (reservationCount / space.capacity) * 100;

    let availability = 'Available';
    if (availableSeats === 0) {
      availability = 'Full';
    } else if (percentFull >= 80) {
      availability = 'Busy';
    }

    res.json({
      ...space,
      currentReservations: reservationCount,
      availableSeats,
      availability
    });
  } catch (error) {
    console.error('Error fetching study space:', error);
    res.status(500).json({ error: 'Failed to fetch study space' });
  }
};

// Create a new reservation
export const createReservation = async (req, res) => {
  try {
    const { spaceId, date } = req.body;
    const studentId = req.user.id; // From auth middleware

    // Validate input
    if (!spaceId) {
      return res.status(400).json({ error: 'Space ID is required' });
    }

    // Default to today if no date provided
    // Use UTC to avoid timezone issues - create date at UTC midnight
    let reservationDate;
    if (date) {
      reservationDate = new Date(date);
    } else {
      // Get today's date in YYYY-MM-DD format and create UTC date
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      reservationDate = new Date(dateStr + 'T00:00:00.000Z');
    }
    
    console.log('=== CREATE RESERVATION DEBUG ===');
    console.log('Current date/time:', new Date().toISOString());
    console.log('Reservation date ISO:', reservationDate.toISOString());
    console.log('Reservation date local:', reservationDate.toLocaleDateString('en-CA'));

    // Check if date is in the past - compare UTC dates
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA');
    const today = new Date(todayStr + 'T00:00:00.000Z');
    console.log('Today for comparison:', today.toISOString());
    if (reservationDate < today) {
      return res.status(400).json({ error: 'Cannot reserve for past dates' });
    }

    // Get study space
    const space = await prisma.studySpace.findUnique({
      where: { id: spaceId }
    });

    if (!space) {
      return res.status(404).json({ error: 'Study space not found' });
    }

    // Check current capacity
    const currentReservations = await prisma.studySpaceReservation.count({
      where: {
        spaceId,
        date: reservationDate,
        status: 'ACTIVE'
      }
    });

    if (currentReservations >= space.capacity) {
      return res.status(400).json({ 
        error: 'This space is at full capacity',
        availableSeats: 0
      });
    }

    // Check if student already has a reservation for this space on this date
    const existingReservation = await prisma.studySpaceReservation.findFirst({
      where: {
        studentId,
        spaceId,
        date: reservationDate,
        status: 'ACTIVE'
      }
    });

    if (existingReservation) {
      return res.status(400).json({ 
        error: 'You already have a reservation for this space on this date' 
      });
    }

    // Check student's active reservation limit (max 3)
    const activeReservations = await prisma.studySpaceReservation.count({
      where: {
        studentId,
        status: 'ACTIVE',
        date: {
          gte: today
        }
      }
    });

    if (activeReservations >= 3) {
      return res.status(400).json({ 
        error: 'You have reached the maximum limit of 3 active reservations' 
      });
    }

    // Create reservation
    const reservation = await prisma.studySpaceReservation.create({
      data: {
        studentId,
        spaceId,
        date: reservationDate,
        timeSlot: 'ALL_DAY', // Default value for all-day reservation
        status: 'ACTIVE'
      },
      include: {
        space: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    console.log('=== RESERVATION CREATED ===');
    console.log('Saved date:', reservation.date);
    console.log('Saved date ISO:', new Date(reservation.date).toISOString());
    console.log('Saved date local:', new Date(reservation.date).toLocaleDateString('en-CA'));
    console.log('===========================');

    // Create notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'STUDY_SPACE_RESERVED',
        message: `You have successfully reserved ${space.name} for ${reservationDate.toLocaleDateString()}`,
        read: false
      }
    });

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation,
      availableSeats: space.capacity - currentReservations - 1
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
};

// Get user's reservations
export const getUserReservations = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status } = req.query; // Optional filter: 'ACTIVE', 'COMPLETED', 'CANCELLED'

    const where = { studentId };
    if (status) {
      where.status = status;
    }

    const reservations = await prisma.studySpaceReservation.findMany({
      where,
      include: {
        space: true
      },
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

// Cancel a reservation
export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const reservation = await prisma.studySpaceReservation.findUnique({
      where: { id },
      include: { space: true }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Check if reservation belongs to the student
    if (reservation.studentId !== studentId) {
      return res.status(403).json({ error: 'Unauthorized to cancel this reservation' });
    }

    // Check if already cancelled or completed
    if (reservation.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'This reservation is already cancelled or completed' });
    }

    // Update reservation status
    const updatedReservation = await prisma.studySpaceReservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { space: true }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'STUDY_SPACE_CANCELLED',
        message: `Your reservation for ${reservation.space.name} on ${reservation.date.toLocaleDateString()} has been cancelled`,
        read: false
      }
    });

    res.json({
      message: 'Reservation cancelled successfully',
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
};

// Admin: Create study space
export const createStudySpace = async (req, res) => {
  try {
    const { name, category, description, capacity, location, hours, amenities, image, color } = req.body;

    // Validate required fields
    if (!name || !category || !description || !capacity || !location || !hours) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const studySpace = await prisma.studySpace.create({
      data: {
        name,
        category,
        description,
        capacity: parseInt(capacity),
        location,
        hours,
        amenities: amenities || [],
        image: image || '📚',
        color: color || '#4f46e5'
      }
    });

    res.status(201).json({
      message: 'Study space created successfully',
      studySpace
    });
  } catch (error) {
    console.error('Error creating study space:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A study space with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create study space' });
  }
};

// Admin: Update study space
export const updateStudySpace = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Convert capacity to integer if provided
    if (updates.capacity) {
      updates.capacity = parseInt(updates.capacity);
    }

    const studySpace = await prisma.studySpace.update({
      where: { id },
      data: updates
    });

    res.json({
      message: 'Study space updated successfully',
      studySpace
    });
  } catch (error) {
    console.error('Error updating study space:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Study space not found' });
    }
    res.status(500).json({ error: 'Failed to update study space' });
  }
};

// Admin: Delete study space
export const deleteStudySpace = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.studySpace.delete({
      where: { id }
    });

    res.json({ message: 'Study space deleted successfully' });
  } catch (error) {
    console.error('Error deleting study space:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Study space not found' });
    }
    res.status(500).json({ error: 'Failed to delete study space' });
  }
};

// Get statistics for admin dashboard
export const getStatistics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSpaces, todayReservations, activeReservations] = await Promise.all([
      prisma.studySpace.count(),
      prisma.studySpaceReservation.count({
        where: {
          date: today,
          status: 'ACTIVE'
        }
      }),
      prisma.studySpaceReservation.count({
        where: {
          status: 'ACTIVE',
          date: {
            gte: today
          }
        }
      })
    ]);

    // Get most popular spaces
    const popularSpaces = await prisma.studySpaceReservation.groupBy({
      by: ['spaceId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    const popularSpacesWithNames = await Promise.all(
      popularSpaces.map(async (item) => {
        const space = await prisma.studySpace.findUnique({
          where: { id: item.spaceId }
        });
        return {
          space: space.name,
          reservations: item._count.id
        };
      })
    );

    res.json({
      totalSpaces,
      todayReservations,
      activeReservations,
      popularSpaces: popularSpacesWithNames
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// Admin: Get all reservations with details
export const getAllReservations = async (req, res) => {
  try {
    const { status, date, spaceId } = req.query;
    
    // Get today at UTC midnight to avoid timezone issues
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA');
    const today = new Date(todayStr + 'T00:00:00.000Z');

    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (date) {
      // Parse the provided date properly
      const targetDate = new Date(date + 'T00:00:00.000Z');
      where.date = targetDate;
    } else {
      // Default to today's reservations
      where.date = today;
    }
    
    if (spaceId) {
      where.spaceId = spaceId;
    }
    
    console.log('Admin fetching reservations with filter:', where);
    console.log('Today string:', todayStr, 'Today UTC:', today.toISOString());
    
    // Debug: Check what dates exist in the database
    const allReservations = await prisma.studySpaceReservation.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, date: true, spaceId: true }
    });
    console.log('All ACTIVE reservations in DB:', allReservations.map(r => ({
      id: r.id.substring(0, 8),
      date: r.date.toISOString(),
      dateLocal: new Date(r.date).toLocaleDateString('en-CA')
    })));

    const reservations = await prisma.studySpaceReservation.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        space: true
      },
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Group by space
    const groupedBySpace = reservations.reduce((acc, reservation) => {
      const spaceName = reservation.space.name;
      if (!acc[spaceName]) {
        acc[spaceName] = {
          space: reservation.space,
          reservations: []
        };
      }
      acc[spaceName].reservations.push({
        id: reservation.id,
        student: reservation.student,
        date: reservation.date,
        status: reservation.status,
        createdAt: reservation.createdAt
      });
      return acc;
    }, {});

    res.json({
      total: reservations.length,
      groupedBySpace,
      allReservations: reservations
    });
  } catch (error) {
    console.error('Error fetching all reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

// Cleanup old reservations (mark as COMPLETED)
export const cleanupOldReservations = async (req, res) => {
  try {
    // Get today at UTC midnight to avoid timezone issues
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const today = new Date(todayStr + 'T00:00:00.000Z');
    
    console.log('Manual cleanup triggered - Today:', today.toISOString());
    console.log('Today local:', todayStr);
    
    // Find old reservations
    const oldReservations = await prisma.studySpaceReservation.findMany({
      where: {
        status: 'ACTIVE',
        date: {
          lt: today
        }
      },
      include: {
        space: true,
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    console.log(`Found ${oldReservations.length} old reservations`);
    
    // Mark them as COMPLETED
    const result = await prisma.studySpaceReservation.updateMany({
      where: {
        status: 'ACTIVE',
        date: {
          lt: today
        }
      },
      data: {
        status: 'COMPLETED'
      }
    });
    
    res.json({
      message: 'Cleanup completed successfully',
      count: result.count,
      cleaned: oldReservations.map(r => ({
        student: `${r.student.firstName} ${r.student.lastName}`,
        space: r.space.name,
        date: r.date
      }))
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ error: 'Failed to cleanup reservations' });
  }
};
