import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  registerForEvent,
  unregisterFromEvent,
  getUserRegistrations,
  getEventRegistrations,
  checkRegistration
} from '../controllers/registrationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Register for an event
router.post('/register', registerForEvent);

// Unregister from an event
router.delete('/unregister/:eventId', unregisterFromEvent);

// Get user's registered events
router.get('/my-registrations', getUserRegistrations);

// Check if user is registered for a specific event
router.get('/check/:eventId', checkRegistration);

// Get registrations for a specific event (for event creators/admins)
router.get('/event/:eventId', getEventRegistrations);

export default router;
