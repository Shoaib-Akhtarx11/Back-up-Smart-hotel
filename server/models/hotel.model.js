import mongoose from 'mongoose';

const HotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a hotel name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
      trim: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a manager ID'],
    },
    amenities: [String],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Hotel', HotelSchema);