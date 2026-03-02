import express from 'express';
import {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/room.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router
  .route('/')
  .get(getRooms)
  .post(protect, authorize('manager', 'admin'), createRoom);

router
  .route('/:id')
  .get(getRoom)
  .put(protect, authorize('manager', 'admin'), updateRoom)
  .delete(protect, authorize('manager', 'admin'), deleteRoom);

export default router;