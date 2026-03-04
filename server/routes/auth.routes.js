import express from 'express';
import { 
  register, 
  login,
  logout,
  getAllUsers,
  updateProfile, 
  changePassword,
  getMe,
  getUserAccountData
} from '../controllers/auth.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes - Get current user
router.get('/me', protect, getMe);

// Protected routes - Get user account data with bookings (using aggregation)
router.get('/account-data', protect, getUserAccountData);

// Protected routes - Admin only
router.get('/users', protect, authorize('admin'), getAllUsers);

// Protected routes - All authenticated users
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
