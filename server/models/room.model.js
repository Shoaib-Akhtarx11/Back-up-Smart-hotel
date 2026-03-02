import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel reference is required'],
    },
    type: {
      type: String,
      required: [true, 'Please provide a room type'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    availability: {
      type: Boolean,
      default: true,
    },
    features: [String],
  },
  { timestamps: true }
);

export default mongoose.model('Room', RoomSchema);