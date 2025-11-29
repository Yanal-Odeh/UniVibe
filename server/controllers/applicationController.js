import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create application
export const createApplication = async (req, res) => {
  try {
    const { communityId, name, studentNumber, age, major, phoneNumber, city } = req.body;
    const userId = req.user.id;

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
      orderBy: { createdAt: 'desc' }
    });

    res.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Update application status (admin only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await prisma.applicationForm.update({
      where: { id },
      data: { status }
    });

    // If approved, add user to community
    if (status === 'APPROVED') {
      await prisma.communityMember.create({
        data: {
          userId: application.userId,
          communityId: application.communityId
        }
      });
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
