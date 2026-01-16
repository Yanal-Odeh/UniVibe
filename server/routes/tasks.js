import express from 'express';
import {
  getEventTasks,
  getMyTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getCommunityMembers,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all tasks for an event
router.get('/events/:eventId/tasks', getEventTasks);

// Get my tasks for an event
router.get('/events/:eventId/my-tasks', getMyTasks);

// Get community members for task assignment
router.get('/events/:eventId/members', getCommunityMembers);

// Create a new task
router.post('/events/:eventId/tasks', createTask);

// Update task status
router.patch('/tasks/:taskId/status', updateTaskStatus);

// Update task details
router.put('/tasks/:taskId', updateTask);

// Delete a task
router.delete('/tasks/:taskId', deleteTask);

export default router;
