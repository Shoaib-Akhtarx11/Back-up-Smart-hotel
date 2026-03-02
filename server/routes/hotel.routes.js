import express from 'express';
import {
  createHotel,
  getHotels,
  getHotel,
  updateHotel,
  deleteHotel,
} from '../controllers/hotel.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router
  .route('/')
  .get(getHotels)
  .post(protect, authorize('manager', 'admin'), createHotel);

router
  .route('/:id')
  .get(getHotel)
  .put(protect, authorize('manager', 'admin'), updateHotel)
  .delete(protect, authorize('manager', 'admin'), deleteHotel);

export default router;