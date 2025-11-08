import express from 'express';
import {
  getAllCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  removeMember,
  updateMemberRole
} from '../controllers/communityController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllCommunities);
router.get('/:id', getCommunityById);

// Authenticated routes
router.post('/:id/join', authenticate, joinCommunity);
router.post('/:id/leave', authenticate, leaveCommunity);

// Admin only routes
router.post('/', authenticate, requireAdmin, createCommunity);
router.patch('/:id', authenticate, requireAdmin, updateCommunity);
router.delete('/:id', authenticate, requireAdmin, deleteCommunity);
router.delete('/:id/members/:userId', authenticate, requireAdmin, removeMember);
router.patch('/:id/members/:userId/role', authenticate, requireAdmin, updateMemberRole);

export default router;
