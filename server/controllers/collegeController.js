import prisma from '../utils/prisma.js';

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

// Get locations for the current user's college (for club leaders)
export const getMyCollegeLocations = async (req, res) => {
  try {
    const user = req.user;
    console.log('🔍 Fetching locations for user:', user.id, 'Role:', user.role, 'Email:', user.email);

    // If user doesn't have a collegeId, try to find it through their led community
    let collegeId = user.collegeId;
    let communityInfo = null;

    if (!collegeId) {
      console.log('⚠️  User has no collegeId, searching for led community...');
      // Find the community this user leads (correct field name: clubLeaderId)
      const ledCommunity = await prisma.community.findFirst({
        where: {
          clubLeaderId: user.id
        },
        include: {
          college: true
        }
      });

      console.log('🔍 Community search result:', ledCommunity ? `Found: ${ledCommunity.name}` : 'None found');

      if (ledCommunity && ledCommunity.college) {
        collegeId = ledCommunity.college.id;
        communityInfo = {
          id: ledCommunity.id,
          name: ledCommunity.name
        };
        console.log(`✅ Found community: ${ledCommunity.name}, College: ${ledCommunity.college.name}`);
      } else if (ledCommunity && !ledCommunity.college) {
        console.log(`⚠️  Community "${ledCommunity.name}" found but has NO COLLEGE assigned!`);
        return res.status(400).json({ 
          error: 'Community not linked to college',
          message: `Your community "${ledCommunity.name}" is not assigned to any college. Please contact an administrator to link it to a college.`
        });
      }
    }

    if (!collegeId) {
      console.log('❌ No college found for user');
      return res.status(404).json({ 
        error: 'No college found',
        message: 'Please contact admin to assign you to a college'
      });
    }

    // Get college with locations
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      include: {
        locations: {
          orderBy: {
            name: 'asc'
          }
        }
      }
    });

    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // If we don't have community info yet, try to find it
    if (!communityInfo && college) {
      const community = await prisma.community.findFirst({
        where: {
          collegeId: college.id,
          clubLeaderId: user.id
        }
      });
      
      if (community) {
        communityInfo = {
          id: community.id,
          name: community.name
        };
      }
    }

    console.log(`✅ Found ${college.locations.length} locations for ${college.name}`);
    res.json({
      locations: college.locations,
      collegeId: college.id,
      collegeName: college.name,
      communityId: communityInfo?.id || '',
      communityName: communityInfo?.name || ''
    });
  } catch (error) {
    console.error('Error fetching user college locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};
