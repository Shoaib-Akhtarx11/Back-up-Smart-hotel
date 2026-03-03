import mongoose from 'mongoose';

const LoyaltySchema = new mongoose.Schema(
  {
    LoyaltyID: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    UserID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    PointsBalance: {
      type: Number,
      default: 0,
      min: [0, 'Points balance cannot be negative'],
    },
    LastUpdated: {
      type: Date,
      default: Date.now,
      required: [true, 'LastUpdated is required'],
    },
  },
  { timestamps: true }
);

export default mongoose.model('LoyaltyAccount', LoyaltySchema);