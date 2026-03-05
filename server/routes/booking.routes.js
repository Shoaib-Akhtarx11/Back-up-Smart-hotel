import express from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getBookingDetails,
  updateBookingStatus,
} from '../controllers/booking.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getBookings)
  .post(protect, authorize('guest'), createBooking);

// Route for users to cancel their own bookings - must be defined BEFORE /:id route
router.put('/:id/cancel', cancelBooking);

// New route for getting booking details with full information
router.get('/:id/details', protect, getBookingDetails);

// New route for manager to update booking status (approve/disapprove)
router.put('/:id/status', protect, authorize('manager', 'admin'), updateBookingStatus);

router.route('/:id')
  .get(protect, getBooking)
  .put(protect, authorize('admin', 'manager'), updateBooking)
  .delete(protect, authorize('admin', 'manager'), cancelBooking);

export default router;
