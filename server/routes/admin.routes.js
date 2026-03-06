import express from 'express';
import { 
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAllHotels,
  deleteHotel,
  getAllBookings,
  updateBookingStatus,
  getMostBookedHotels,
  getDashboardStats,
  getAllReviews,
  deleteReview
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// Users management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Hotels management
router.get('/hotels', getAllHotels);
router.delete('/hotels/:id', deleteHotel);

// Bookings management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// Analytics
router.get('/analytics/most-booked', getMostBookedHotels);

// Reviews management
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

export default router;

