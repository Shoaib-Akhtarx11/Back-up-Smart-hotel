import express from 'express';
import {
  getLoyalty,
  createLoyalty,
  updateLoyalty,
} from '../controllers/loyalty.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getLoyalty)
  .post(protect, createLoyalty);

router.route('/:id')
  .put(protect, authorize('admin'), updateLoyalty);

export default router;