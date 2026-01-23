import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all tasks for an event
export const getEventTasks = async (req, res) => {
  try {
    const { eventId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { eventId },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching event tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get tasks assigned to current user for an event
export const getMyTasks = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const tasks = await prisma.task.findMany({
      where: { 
        eventId,
        assignedToId: userId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, assignedToId } = req.body;
    const assignedById = req.user.id;

    // Verify the event exists and get its community
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { community: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.community) {
      return res.status(400).json({ error: 'Event must be associated with a community' });
    }

    // Verify the user is the club leader of the event's community
    if (event.community.clubLeaderId !== assignedById) {
      return res.status(403).json({ error: 'Only the club leader can assign tasks' });
    }

    // Verify the assigned user is a member of the community
    const isMember = await prisma.communityMember.findFirst({
      where: {
        userId: assignedToId,
        communityId: event.communityId,
      },
    });

    if (!isMember) {
      return res.status(400).json({ error: 'Can only assign tasks to community members' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        eventId,
        assignedToId,
        assignedById,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        event: {
          include: {
            community: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the assigned user or club leader can update the task
    const isAssignedUser = task.assignedToId === userId;
    const isClubLeader = task.event.community?.clubLeaderId === userId;

    if (!isAssignedUser && !isClubLeader) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Update task details (title/description)
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, assignedToId } = req.body;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        event: {
          include: {
            community: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the club leader can update task details
    const isClubLeader = task.event.community?.clubLeaderId === userId;

    if (!isClubLeader) {
      return res.status(403).json({ error: 'Only the club leader can update task details' });
    }

    // If reassigning, verify the new user is a member
    if (assignedToId && assignedToId !== task.assignedToId) {
      const isMember = await prisma.communityMember.findFirst({
        where: {
          userId: assignedToId,
          communityId: task.event.communityId,
        },
      });

      if (!isMember) {
        return res.status(400).json({ error: 'Can only assign tasks to community members' });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(assignedToId && { assignedToId }),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        event: {
          include: {
            community: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the club leader can delete tasks
    const isClubLeader = task.event.community?.clubLeaderId === userId;

    if (!isClubLeader) {
      return res.status(403).json({ error: 'Only the club leader can delete tasks' });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// Get community members for task assignment
export const getCommunityMembers = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Get the event and verify club leader
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { community: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.community) {
      return res.status(400).json({ error: 'Event must be associated with a community' });
    }

    if (event.community.clubLeaderId !== userId) {
      return res.status(403).json({ error: 'Only the club leader can view community members' });
    }

    // Get all community members
    const members = await prisma.communityMember.findMany({
      where: { communityId: event.communityId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: 'asc',
        },
      },
    });

    const membersList = members.map(m => m.user);
    res.json(membersList);
  } catch (error) {
    console.error('Error fetching community members:', error);
    res.status(500).json({ error: 'Failed to fetch community members' });
  }
};

// Upload a file submission for a task
export const uploadTaskSubmission = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify the task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        event: {
          include: {
            community: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the assigned user can upload submissions
    if (task.assignedToId !== userId) {
      return res.status(403).json({ error: 'You can only upload files for tasks assigned to you' });
    }

    // Create the submission
    const submission = await prisma.taskSubmission.create({
      data: {
        taskId,
        fileName: file.originalname,
        fileUrl: file.path,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Error uploading task submission:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

// Get all submissions for a task
export const getTaskSubmissions = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Verify the task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        event: {
          include: {
            community: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the assigned user or club leader can view submissions
    const isAssignedUser = task.assignedToId === userId;
    const isClubLeader = task.event.community?.clubLeaderId === userId;

    if (!isAssignedUser && !isClubLeader) {
      return res.status(403).json({ error: 'Not authorized to view these submissions' });
    }

    const submissions = await prisma.taskSubmission.findMany({
      where: { taskId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching task submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

// Delete a task submission
export const deleteTaskSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user.id;

    // Get the submission with task details
    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        task: {
          include: {
            event: {
              include: {
                community: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Only the uploader or club leader can delete
    const isUploader = submission.uploadedById === userId;
    const isClubLeader = submission.task.event.community?.clubLeaderId === userId;

    if (!isUploader && !isClubLeader) {
      return res.status(403).json({ error: 'Not authorized to delete this submission' });
    }

    // Delete the file from filesystem
    const fs = await import('fs/promises');
    try {
      await fs.unlink(submission.fileUrl);
    } catch (fileError) {
      console.error('Error deleting file from filesystem:', fileError);
      // Continue even if file deletion fails
    }

    // Delete from database
    await prisma.taskSubmission.delete({
      where: { id: submissionId },
    });

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting task submission:', error);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
};
