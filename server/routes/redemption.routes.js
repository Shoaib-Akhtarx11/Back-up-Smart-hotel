import express from 'express';
import {
  createRedemption,
  getRedemptions,
  getRedemption,
  deleteRedemption,
} from '../controllers/redemption.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getRedemptions)
  .post(protect, createRedemption);

router.route('/:id')
  .get(protect, getRedemption)
  .delete(protect, deleteRedemption);

export default router;