import express from 'express';
import { 
  signup, 
  login, 
  logout, 
  getCurrentUser,
  getAdminPreferences,
  updateAdminPreferences 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);
router.get('/preferences', authenticate, getAdminPreferences);
router.patch('/preferences', authenticate, updateAdminPreferences);

export default router;
