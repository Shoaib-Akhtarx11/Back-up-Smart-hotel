import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    PaymentID: {
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
    Amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    Status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    PaymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', PaymentSchema);