import Hotel from '../models/hotel.model.js';
import Room from '../models/room.model.js';

// @desc    Create a new hotel (manager or admin)
// @route   POST /api/hotels
// @access  Private (manager/admin)
export const createHotel = async (req, res) => {
  try {
    const { Name, Location, Amenities, Image } = req.body;

    if (!Name || !Location) {
      return res.status(400).json({ success: false, message: 'Name and Location are required' });
    }

    const hotel = await Hotel.create({
      Name,
      Location,
      Amenities: Amenities || [],
      Image: Image || '',
      ManagerID: req.user.id,
    });

    return res.status(201).json({ success: true, data: hotel });
  } catch (error) {
    console.error('Create hotel error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get list of hotels with server-side filtering (public)
// @route   GET /api/hotels
// @access  Public
export const getHotels = async (req, res) => {
  try {
    const { location, priceMin, priceMax, sortBy, searchQuery, features } = req.query;

    // Build the aggregation pipeline
    const pipeline = [];

    // Stage 1: Lookup rooms for each hotel
    pipeline.push({
      $lookup: {
        from: 'rooms',
        localField: '_id',
        foreignField: 'HotelID',
        as: 'rooms'
      }
    });

    // Stage 2: Add minPrice field from rooms
    pipeline.push({
      $addFields: {
        minPrice: {
          $cond: {
            if: { $gt: [{ $size: '$rooms' }, 0] },
            then: { $min: '$rooms.Price' },
            else: null
          }
        },
        // Also get available rooms count
        availableRoomsCount: {
          $size: {
            $filter: {
              input: '$rooms',
              as: 'room',
              cond: { $eq: ['$$room.Availability', true] }
            }
          }
        }
      }
    });

    // Stage 3: Build match conditions for filtering
    const matchConditions = {};

    // Filter by location
    if (location && location !== 'Any region') {
      matchConditions.Location = { $regex: location, $options: 'i' };
    }

    // Filter by price range (using minPrice)
    if (priceMin || priceMax) {
      matchConditions.minPrice = {};
      if (priceMin) matchConditions.minPrice.$gte = Number(priceMin);
      if (priceMax) matchConditions.minPrice.$lte = Number(priceMax);
    }

    // Filter by search query (name or location)
    if (searchQuery) {
      matchConditions.$or = [
        { Name: { $regex: searchQuery, $options: 'i' } },
        { Location: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Filter by features (amenities)
    if (features) {
      const featureList = features.split(',');
      matchConditions.Amenities = { $all: featureList };
    }

    // Add match stage if we have conditions
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Stage 4: Sort results
    let sortStage = {};
    switch (sortBy) {
      case 'Price ascending':
        sortStage = { minPrice: 1 };
        break;
      case 'Price descending':
        sortStage = { minPrice: -1 };
        break;
      case 'Rating & Recommended':
        sortStage = { Rating: -1 };
        break;
      default:
        // Default sort - keep original order
        sortStage = { _id: 1 };
    }
    pipeline.push({ $sort: sortStage });

    // Execute aggregation
    const hotels = await Hotel.aggregate(pipeline);

    // Populate manager info for each hotel
    const hotelsWithManager = await Hotel.populate(hotels, { path: 'ManagerID', select: 'Name Email ContactNumber' });

    return res.status(200).json({ success: true, data: hotelsWithManager });
  } catch (error) {
    console.error('Get hotels error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get single hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
export const getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('ManagerID', 'Name Email ContactNumber');
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    return res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    console.error('Get hotel error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update hotel (manager or admin)
// @route   PUT /api/hotels/:id
// @access  Private (manager/admin)
export const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Only manager who owns hotel or admin can update
    if (hotel.ManagerID.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { Name, Location, Amenities, Rating, Image } = req.body;
    if (Name) hotel.Name = Name;
    if (Location) hotel.Location = Location;
    if (Amenities) hotel.Amenities = Amenities;
    if (Rating !== undefined) hotel.Rating = Rating;
    if (Image) hotel.Image = Image;

    await hotel.save();

    return res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    console.error('Update hotel error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete hotel (manager or admin)
// @route   DELETE /api/hotels/:id
// @access  Private (manager/admin)
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    if (hotel.ManagerID.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Hotel.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: 'Hotel deleted' });
  } catch (error) {
    console.error('Delete hotel error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
