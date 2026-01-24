import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getEventTasks,
  getMyTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getCommunityMembers,
  uploadTaskSubmission,
  getTaskSubmissions,
  deleteTaskSubmission,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/task-submissions/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'submission-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, and videos are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  }
});

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

// Task submission routes
// Upload a file submission for a task
router.post('/tasks/:taskId/submissions', upload.single('file'), uploadTaskSubmission);

// Get all submissions for a task
router.get('/tasks/:taskId/submissions', getTaskSubmissions);

// Delete a submission
router.delete('/submissions/:submissionId', deleteTaskSubmission);

export default router;
