import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} from '../controllers/studentController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllStudents);
router.get('/:id', getStudentById);

// Admin only routes
router.post('/', requireAdmin, createStudent);
router.patch('/:id', requireAdmin, updateStudent);
router.delete('/:id', requireAdmin, deleteStudent);

export default router;
