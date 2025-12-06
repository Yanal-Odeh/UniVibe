import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  saveEvent,
  unsaveEvent,
  getSavedEvents,
  checkSavedEvent
} from '../controllers/savedEventController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Save an event
router.post('/save', saveEvent);

// Unsave an event
router.delete('/unsave/:eventId', unsaveEvent);

// Get user's saved events
router.get('/my-saved', getSavedEvents);

// Check if event is saved
router.get('/check/:eventId', checkSavedEvent);

export default router;
