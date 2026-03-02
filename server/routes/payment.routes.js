import express from 'express';
import {
  createPayment,
  getPayments,
  getPayment,
  updatePayment,
  deletePayment,
} from '../controllers/payment.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPayments)
  .post(protect, authorize('guest'), createPayment);

router.route('/:id')
  .get(protect, getPayment)
  .put(protect, authorize('admin'), updatePayment)
  .delete(protect, authorize('admin'), deletePayment);

export default router;