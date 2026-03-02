import express from 'express';
import {
  createRedemption,
  getRedemptions,
  deleteRedemption,
} from '../controllers/redemption.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getRedemptions)
  .post(protect, authorize('guest'), createRedemption);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteRedemption);

export default router;