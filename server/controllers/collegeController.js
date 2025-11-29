import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all colleges with location count
export const getColleges = async (req, res) => {
  try {
    const colleges = await prisma.college.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: { locations: true }
        }
      }
    });

    res.json(colleges);
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
};

// Get all locations for a specific college
export const getCollegeLocations = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching locations for college ID:', id, 'Type:', typeof id);
    
    if (!id) {
      return res.status(400).json({ error: 'College ID is required' });
    }
    
    const locations = await prisma.location.findMany({
      where: {
        collegeId: id // ID is a string, not an integer
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('Found locations:', locations.length);
    res.json(locations);
  } catch (error) {
    console.error('Error fetching college locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

// Get a specific location with college info
export const getLocation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const location = await prisma.location.findUnique({
      where: {
        id: id // ID is a string, not an integer
      },
      include: {
        college: true
      }
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
};
