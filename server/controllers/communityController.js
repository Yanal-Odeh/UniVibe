import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllCommunities = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user?.id; // Get userId if authenticated

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {};

    const communities = await prisma.community.findMany({
      where,
      include: {
        _count: {
          select: { members: true }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: {
            joinedAt: 'asc'
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to match frontend expectations
    const transformedCommunities = communities.map(community => ({
      id: community.id,
      name: community.name,
      description: community.description,
      avatar: community.avatar,
      color: community.color,
      collegeId: community.collegeId,
      memberCount: community._count.members,
      isMember: userId ? community.members.some(member => member.user.id === userId) : false,
      members: community.members.map(member => ({
        id: member.user.id,
        name: `${member.user.firstName} ${member.user.lastName}`,
        email: member.user.email,
        role: member.user.role.toLowerCase(),
        joinDate: member.joinedAt
      })),
      createdAt: community.createdAt,
      updatedAt: community.updatedAt
    }));

    res.json({ communities: transformedCommunities });
  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
};

export const getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        events: {
          orderBy: { startDate: 'asc' }
        }
      }
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json({ community });
  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
};

export const createCommunity = async (req, res) => {
  try {
    const { name, description, avatar, color } = req.body;

    // Validate input
    if (!name || !description || !avatar || !color) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if community exists
    const existingCommunity = await prisma.community.findUnique({
      where: { name }
    });

    if (existingCommunity) {
      return res.status(409).json({ error: 'Community name already exists' });
    }

    // Create community
    const community = await prisma.community.create({
      data: {
        name,
        description,
        avatar,
        color,
        createdBy: req.user.id
      },
      include: {
        _count: {
          select: { members: true }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Transform to match frontend expectations
    const transformedCommunity = {
      id: community.id,
      name: community.name,
      description: community.description,
      avatar: community.avatar,
      color: community.color,
      memberCount: community._count.members,
      members: community.members.map(member => ({
        id: member.user.id,
        name: `${member.user.firstName} ${member.user.lastName}`,
        email: member.user.email,
        role: member.user.role.toLowerCase(),
        joinDate: member.joinedAt
      })),
      createdAt: community.createdAt,
      updatedAt: community.updatedAt
    };

    res.status(201).json({ community: transformedCommunity });
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({ error: 'Failed to create community' });
  }
};

export const updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, avatar, color } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (avatar) updateData.avatar = avatar;
    if (color) updateData.color = color;

    const community = await prisma.community.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { members: true }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Transform to match frontend expectations
    const transformedCommunity = {
      id: community.id,
      name: community.name,
      description: community.description,
      avatar: community.avatar,
      color: community.color,
      memberCount: community._count.members,
      members: community.members.map(member => ({
        id: member.user.id,
        name: `${member.user.firstName} ${member.user.lastName}`,
        email: member.user.email,
        role: member.user.role.toLowerCase(),
        joinDate: member.joinedAt
      })),
      createdAt: community.createdAt,
      updatedAt: community.updatedAt
    };

    res.json({ community: transformedCommunity });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Community not found' });
    }
    console.error('Update community error:', error);
    res.status(500).json({ error: 'Failed to update community' });
  }
};

export const deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.community.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Community deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Community not found' });
    }
    console.error('Delete community error:', error);
    res.status(500).json({ error: 'Failed to delete community' });
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId: id
        }
      }
    });

    if (existingMember) {
      return res.status(409).json({ error: 'Already a member of this community' });
    }

    // Add member
    await prisma.communityMember.create({
      data: {
        userId,
        communityId: id
      }
    });

    res.json({ success: true, message: 'Joined community successfully' });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
};

export const leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.communityMember.delete({
      where: {
        userId_communityId: {
          userId,
          communityId: id
        }
      }
    });

    res.json({ success: true, message: 'Left community successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Not a member of this community' });
    }
    console.error('Leave community error:', error);
    res.status(500).json({ error: 'Failed to leave community' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    await prisma.communityMember.delete({
      where: {
        userId_communityId: {
          userId,
          communityId: id
        }
      }
    });

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Member not found' });
    }
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can update member roles' });
    }

    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
};
