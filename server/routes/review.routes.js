import express from 'express';
import {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
} from '../controllers/review.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(getReviews)
  .post(protect, authorize('guest'), createReview);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

export default router;