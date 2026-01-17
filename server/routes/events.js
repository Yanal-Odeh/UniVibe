import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  facultyApproval,
  facultyReject,
  deanApproval,
  deanReject,
  deanshipApproval,
  deanshipReject,
  respondToRevision,
  respondToDeanshipRevision,
  getPendingApprovals
} from '../controllers/eventController.js';
import {
  uploadEventMedia,
  getEventMedia,
  deleteEventMedia
} from '../controllers/eventMediaController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// IMPORTANT: Order matters! Specific routes MUST come before parameterized routes
// Otherwise /:id will capture "/pending" as an id parameter

// Authenticated specific routes (must be before /:id)
router.get('/pending/approvals', authenticate, getPendingApprovals);

// Public routes - optionalAuth allows showing user's own pending events
router.get('/', optionalAuth, getAllEvents);
router.get('/:id', getEventById);

// Authenticated routes - Club Leaders can create events
router.post('/', authenticate, createEvent);
router.patch('/:id', authenticate, updateEvent);
router.delete('/:id', authenticate, deleteEvent);

// Approval routes
router.post('/:id/approve/faculty', authenticate, facultyApproval);
router.post('/:id/reject/faculty', authenticate, facultyReject);
router.post('/:id/approve/dean', authenticate, deanApproval);
router.post('/:id/reject/dean', authenticate, deanReject);
router.post('/:id/approve/deanship', authenticate, deanshipApproval);
router.post('/:id/reject/deanship', authenticate, deanshipReject);
router.post('/:id/respond-revision', authenticate, respondToRevision);
router.post('/:id/respond-deanship-revision', authenticate, respondToDeanshipRevision);

// Media routes - Club Leaders can upload/delete media for their events
router.post('/:id/media', authenticate, upload.array('media', 10), uploadEventMedia);
router.get('/:id/media', getEventMedia);
router.delete('/:id/media/:mediaId', authenticate, deleteEventMedia);

export default router;
