import express from 'express';
import { getColleges, getCollegeLocations, getLocation } from '../controllers/collegeController.js';

const router = express.Router();

// Get all colleges
router.get('/', getColleges);

// Get all locations for a specific college
router.get('/:id/locations', getCollegeLocations);

// Get a specific location
router.get('/locations/:id', getLocation);

export default router;
