import mongoose from 'mongoose';

const HotelSchema = new mongoose.Schema(
  {
    HotelID: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    Name: {
      type: String,
      required: [true, 'Please provide a hotel name'],
      trim: true,
    },
    Location: {
      type: String,
      required: [true, 'Please provide a location'],
      trim: true,
    },
    ManagerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a manager ID'],
    },
    Amenities: [String],
    Rating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0,
    },
    Image: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Hotel', HotelSchema);
