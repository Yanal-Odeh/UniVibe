import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  facultyApproval,
  deanApproval,
  deanshipApproval,
  getPendingApprovals
} from '../controllers/eventController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes - optionalAuth allows showing user's own pending events
router.get('/', optionalAuth, getAllEvents);
router.get('/:id', getEventById);

// Authenticated routes - Club Leaders can create events
router.post('/', authenticate, createEvent);
router.patch('/:id', authenticate, updateEvent);
router.delete('/:id', authenticate, deleteEvent);

// Approval routes
router.get('/pending/approvals', authenticate, getPendingApprovals);
router.post('/:id/approve/faculty', authenticate, facultyApproval);
router.post('/:id/approve/dean', authenticate, deanApproval);
router.post('/:id/approve/deanship', authenticate, deanshipApproval);

export default router;
