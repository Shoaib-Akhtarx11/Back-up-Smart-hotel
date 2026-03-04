import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    BookingID: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    UserID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    RoomID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room ID is required'],
    },
    NumberOfRooms: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 room is required'],
      max: [10, 'Maximum 10 rooms can be booked at a time'],
    },
    CheckInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    CheckOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    Status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    PaymentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    // Redemption points fields
    RedemptionPointsUsed: {
      type: Number,
      default: 0,
      min: [0, 'Redemption points cannot be negative'],
      max: [500, 'Maximum 500 redemption points can be used at once'],
    },
    RedemptionDiscountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative'],
    },
    RedemptionID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Redemption',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', BookingSchema);

