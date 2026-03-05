import mongoose from 'mongoose';

const ManagerSchema = new mongoose.Schema(
  {
    ManagerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a manager user ID'],
    },
    HotelID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Please provide a hotel ID'],
    },
    DateAssigned: {
      type: Date,
      default: Date.now,
    },
    Status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Prevent duplicate manager for same hotel
ManagerSchema.index({ HotelID: 1 }, { unique: true });
// Index for quick lookups by manager
ManagerSchema.index({ ManagerID: 1 });

const Manager = mongoose.model('Manager', ManagerSchema);

export default Manager;

