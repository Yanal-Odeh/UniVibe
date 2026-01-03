import express from 'express';
import { getColleges, getCollegeLocations, getLocation, getMyCollegeLocations } from '../controllers/collegeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all colleges
router.get('/', getColleges);

// Get locations for current user's college (protected route)
router.get('/my-locations', authenticate, getMyCollegeLocations);

// Get all locations for a specific college
router.get('/:id/locations', getCollegeLocations);

// Get a specific location
router.get('/locations/:id', getLocation);

export default router;
