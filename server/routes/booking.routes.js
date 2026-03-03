import express from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/booking.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getBookings)
  .post(protect, authorize('guest'), createBooking);

router.route('/:id')
  .get(protect, getBooking)
  .put(protect, authorize('admin', 'manager'), updateBooking)
  .delete(protect, authorize('admin', 'manager'), deleteBooking);

export default router;