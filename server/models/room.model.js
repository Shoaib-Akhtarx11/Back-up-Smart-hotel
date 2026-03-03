import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema(
  {
    RoomID: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    HotelID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel ID is required'],
    },
    Type: {
      type: String,
      required: [true, 'Please provide a room type'],
      trim: true,
    },
    Price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    Availability: {
      type: Boolean,
      default: true,
    },
    Features: [String],
  },
  { timestamps: true }
);

export default mongoose.model('Room', RoomSchema);