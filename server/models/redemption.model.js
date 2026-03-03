import mongoose from 'mongoose';

const RedemptionSchema = new mongoose.Schema(
  {
    RedemptionID: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    UserID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    BookingID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
    },
    PointsUsed: {
      type: Number,
      required: [true, 'Points used is required'],
      min: [0, 'Points cannot be negative'],
    },
    DiscountAmount: {
      type: Number,
      required: [true, 'Discount amount is required'],
      min: [0, 'Discount cannot be negative'],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Redemption', RedemptionSchema);