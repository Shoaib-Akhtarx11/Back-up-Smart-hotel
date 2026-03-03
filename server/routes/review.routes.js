import express from 'express';
import {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(getReviews)
  .post(protect, createReview);

router.route('/:id')
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

export default router;