import express from 'express';
import { 
  createApplication, 
  getAllApplications, 
  updateApplicationStatus,
  deleteApplication 
} from '../controllers/applicationController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create application (authenticated users)
router.post('/', authenticate, createApplication);

// Get all applications (admin only)
router.get('/', authenticate, requireAdmin, getAllApplications);

// Update application status (admin only)
router.patch('/:id/status', authenticate, requireAdmin, updateApplicationStatus);

// Delete application (admin only)
router.delete('/:id', authenticate, requireAdmin, deleteApplication);

export default router;
