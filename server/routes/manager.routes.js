import express from 'express';
import {
  getManagerDashboardStats,
  getManagerHotels,
  createManagerHotel,
  updateManagerHotel,
  deleteManagerHotel,
  getManagerRooms,
  createManagerRoom,
  updateManagerRoom,
  deleteManagerRoom,
  getManagerBookings,
  updateManagerBookingStatus,
  getManagerReviews,
  deleteManagerReview,
  getManagerProfile
} from '../controllers/manager.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and manager role
router.use(protect, authorize('manager'));

// Dashboard
router.get('/stats', getManagerDashboardStats);

// Profile
router.get('/profile', getManagerProfile);

// Hotels management
router.get('/hotels', getManagerHotels);
router.post('/hotels', createManagerHotel);
router.put('/hotels/:id', updateManagerHotel);
router.delete('/hotels/:id', deleteManagerHotel);

// Rooms management
router.get('/rooms', getManagerRooms);
router.post('/rooms', createManagerRoom);
router.put('/rooms/:id', updateManagerRoom);
router.delete('/rooms/:id', deleteManagerRoom);

// Bookings management
router.get('/bookings', getManagerBookings);
router.put('/bookings/:id/status', updateManagerBookingStatus);

// Reviews management
router.get('/reviews', getManagerReviews);
router.delete('/reviews/:id', deleteManagerReview);

export default router;

