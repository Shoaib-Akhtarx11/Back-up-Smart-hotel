import express from 'express';
import {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
  respondToReview,
  getManagerHotelReviews,
} from '../controllers/review.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(getReviews)
  .post(protect, createReview);

router.route('/:id')
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, authorize('admin', 'manager'), deleteReview);

// Manager routes
router.route('/:id/respond')
  .put(protect, authorize('manager', 'admin'), respondToReview);

router.route('/manager/:hotelId')
  .get(protect, authorize('manager', 'admin'), getManagerHotelReviews);

export default router;
