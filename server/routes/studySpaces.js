import express from 'express';
import * as studySpaceController from '../controllers/studySpaceController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Cleanup route - must come before /:id route
router.get('/cleanup-old', authenticate, studySpaceController.cleanupOldReservations);

// Public routes (with optional auth for personalized data)
router.get('/', studySpaceController.getAllStudySpaces);
router.get('/:id', studySpaceController.getStudySpace);

// Student routes - require authentication
router.post('/reserve', authenticate, studySpaceController.createReservation);
router.get('/my/reservations', authenticate, studySpaceController.getUserReservations);
router.delete('/reservations/:id', authenticate, studySpaceController.cancelReservation);

// Admin routes - require admin role
router.post('/admin/spaces', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), studySpaceController.createStudySpace);
router.put('/admin/spaces/:id', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), studySpaceController.updateStudySpace);
router.delete('/admin/spaces/:id', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), studySpaceController.deleteStudySpace);
router.get('/admin/statistics', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), studySpaceController.getStatistics);
router.get('/admin/reservations', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), studySpaceController.getAllReservations);

export default router;
