import express from 'express';
import {
  createPayment,
  getPayments,
  getPayment,
  refundPayment,
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPayments)
  .post(protect, createPayment);

router.route('/:id')
  .get(protect, getPayment)
  .put(protect, refundPayment);

export default router;