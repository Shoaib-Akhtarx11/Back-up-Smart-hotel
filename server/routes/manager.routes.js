import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  createManagerProfile,
  getManagerByUserId,
  getManagerByHotelId,
  getAllManagers,
  getCurrentManager,
  updateManagerProfile,
  assignHotelToManager,
  deleteManagerProfile
} from '../controllers/manager.controller.js';

const router = express.Router();

// Public routes
// None for managers

// Protected routes
// All routes require authentication
router.use(protect);

// @route   GET /api/managers/me
// @desc    Get current manager profile
// @access  Private (manager)
router.get('/me', authorize('manager'), getCurrentManager);

// @route   POST /api/managers
// @desc    Create manager profile
// @access  Private (manager)
router.post('/', authorize('manager'), createManagerProfile);

// @route   GET /api/managers
// @desc    Get all managers
// @access  Private (admin)
router.get('/', authorize('admin'), getAllManagers);

// @route   GET /api/managers/user/:userId
// @desc    Get manager by user ID
// @access  Private
router.get('/user/:userId', getManagerByUserId);

// @route   GET /api/managers/hotel/:hotelId
// @desc    Get manager by hotel ID
// @access  Private
router.get('/hotel/:hotelId', getManagerByHotelId);

// @route   PUT /api/managers/:id
// @desc    Update manager profile
// @access  Private (manager)
router.put('/:id', authorize('manager'), updateManagerProfile);

// @route   PUT /api/managers/assign-hotel
// @desc    Assign hotel to manager
// @access  Private (admin)
router.put('/assign-hotel', authorize('admin'), assignHotelToManager);

// @route   DELETE /api/managers/:id
// @desc    Delete manager profile
// @access  Private (admin)
router.delete('/:id', authorize('admin'), deleteManagerProfile);

export default router;

