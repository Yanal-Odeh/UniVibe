import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Authenticated routes - event organizers and admins can create/update/delete
router.post('/', authenticate, requireRole('EVENT_ORGANIZER', 'ADMIN'), createEvent);
router.patch('/:id', authenticate, requireRole('EVENT_ORGANIZER', 'ADMIN'), updateEvent);
router.delete('/:id', authenticate, requireRole('EVENT_ORGANIZER', 'ADMIN'), deleteEvent);

export default router;
