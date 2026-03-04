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
  },
  { timestamps: true }
);

export default mongoose.model('Booking', BookingSchema);

