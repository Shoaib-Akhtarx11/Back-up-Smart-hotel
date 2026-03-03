import express from 'express';
import {
  getLoyalty,
  getLoyaltyHistory,
  updateLoyalty,
  addPoints,
} from '../controllers/loyalty.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:userId', protect, getLoyalty);
router.get('/history/:userId', protect, getLoyaltyHistory);
router.put('/:userId', protect, updateLoyalty);
router.post('/add-points', protect, addPoints);

export default router;