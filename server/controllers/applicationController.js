import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create application
export const createApplication = async (req, res) => {
  try {
    const { communityId, name, studentNumber, age, major, phoneNumber, city } = req.body;
    const userId = req.user.id;

    // Check if user is already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this community' });
    }

    // Check for existing application
    const existingApplication = await prisma.applicationForm.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId
        }
      }
    });

    if (existingApplication) {
      if (existingApplication.status === 'PENDING') {
        return res.status(400).json({ error: 'You already have a pending application for this community' });
      } else if (existingApplication.status === 'APPROVED') {
        return res.status(400).json({ error: 'Your application has already been approved' });
      } else if (existingApplication.status === 'REJECTED') {
        // Delete the rejected application to allow reapplication
        await prisma.applicationForm.delete({
          where: { id: existingApplication.id }
        });
      }
    }

    // Create new application
    const application = await prisma.applicationForm.create({
      data: {
        userId,
        communityId,
        name,
        studentNumber,
        age: parseInt(age),
        major,
        phoneNumber,
        city,
        status: 'PENDING'
      }
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
};

// Get all applications (admin only)
export const getAllApplications = async (req, res) => {
  try {
    const applications = await prisma.applicationForm.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
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
      orderBy: { createdAt: 'desc' }
    });

    res.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Get user's own applications (authenticated users)
export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const applications = await prisma.applicationForm.findMany({
      where: {
        userId
      },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            avatar: true,
            color: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ applications });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ error: 'Failed to fetch your applications' });
  }
};

// Update application status (admin only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    // First get the application details
    const existingApplication = await prisma.applicationForm.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        community: {
          select: {
            name: true
          }
        }
      }
    });

    if (!existingApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update the application status
    const updateData = { status };
    if (status === 'REJECTED' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const application = await prisma.applicationForm.update({
      where: { id },
      data: updateData
    });

    // If approved, add user to community (if not already a member)
    if (status === 'APPROVED') {
      try {
        // Check if user is already a member
        const existingMember = await prisma.communityMember.findUnique({
          where: {
            userId_communityId: {
              userId: application.userId,
              communityId: application.communityId
            }
          }
        });

        // Only add if not already a member
        if (!existingMember) {
          await prisma.communityMember.create({
            data: {
              userId: application.userId,
              communityId: application.communityId
            }
          });
        }

        // Create notification for approved application
        const communityName = existingApplication.community.name;
        await prisma.notification.create({
          data: {
            userId: application.userId,
            type: 'APPLICATION_APPROVED',
            message: `🎉 Congratulations! Your application to join ${communityName} has been approved!`,
            read: false
          }
        });
        
        console.log(`✅ ${existingApplication.user.firstName} ${existingApplication.user.lastName} has been approved to join ${communityName}`);
        
      } catch (memberError) {
        console.error('Error adding community member:', memberError);
        // Don't fail the approval if member already exists
        if (!memberError.code || memberError.code !== 'P2002') {
          throw memberError;
        }
      }
    } else if (status === 'REJECTED') {
      // Create notification for rejected application
      const communityName = existingApplication.community.name;
      const message = rejectionReason 
        ? `❌ Your application to join ${communityName} was rejected. Reason: ${rejectionReason}`
        : `❌ Your application to join ${communityName} was rejected.`;
      
      await prisma.notification.create({
        data: {
          userId: application.userId,
          type: 'APPLICATION_REJECTED',
          message,
          read: false
        }
      });
      
      console.log(`❌ ${existingApplication.user.firstName} ${existingApplication.user.lastName}'s application to ${communityName} was rejected${rejectionReason ? `: ${rejectionReason}` : ''}`);
    }

    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
};

// Delete application (admin only)
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.applicationForm.delete({
      where: { id }
    });

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
};
