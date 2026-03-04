import express from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getBookingDetails,
} from '../controllers/booking.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getBookings)
  .post(protect, authorize('guest'), createBooking);

// New route for getting booking details with full information
router.get('/:id/details', protect, getBookingDetails);

// Route for users to cancel their own bookings
router.delete('/:id/cancel', protect, cancelBooking);

router.route('/:id')
  .get(protect, getBooking)
  .put(protect, authorize('admin', 'manager'), updateBooking)
  .delete(protect, authorize('admin', 'manager'), cancelBooking);

export default router;
