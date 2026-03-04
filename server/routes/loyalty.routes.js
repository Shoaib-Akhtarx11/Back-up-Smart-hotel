import express from 'express';
import {
  getLoyalty,
  getLoyaltyHistory,
  updateLoyalty,
  addPoints,
  purchaseRedemptionPoints,
} from '../controllers/loyalty.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get current user's loyalty account
router.get('/me', protect, getLoyalty);

// Get loyalty history for current user
router.get('/history/me', protect, getLoyaltyHistory);

// Legacy routes (keeping for compatibility)
router.get('/:userId', protect, getLoyalty);
router.get('/history/:userId', protect, getLoyaltyHistory);

// Update loyalty points
router.put('/:userId', protect, updateLoyalty);

// Add points (internal use)
router.post('/add-points', protect, addPoints);

// Purchase redemption points with loyalty points (1:1 ratio)
router.post('/purchase-redemption', protect, purchaseRedemptionPoints);

export default router;
