import Hotel from '../models/hotel.model.js';

// @desc    Create a new hotel (manager or admin)
// @route   POST /api/hotels
// @access  Private (manager/admin)
export const createHotel = async (req, res) => {
  try {
    const { name, location, amenities } = req.body;

    if (!name || !location) {
      return res.status(400).json({ success: false, message: 'Name and location are required' });
    }

    const hotel = await Hotel.create({
      name,
      location,
      amenities,
      manager: req.user.id,
    });

    return res.status(201).json({ success: true, data: hotel });
  } catch (error) {
    console.error('Create hotel error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get list of hotels (public)
// @route   GET /api/hotels
// @access  Public
export const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().populate('manager', 'name email');
    return res.status(200).json({ success: true, data: hotels });
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
    const hotel = await Hotel.findById(req.params.id).populate('manager', 'name email');
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

    // only manager who owns hotel or admin can update
    if (hotel.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this hotel' });
    }

    const { name, location, amenities, rating } = req.body;
    if (name) hotel.name = name;
    if (location) hotel.location = location;
    if (amenities) hotel.amenities = amenities;
    if (rating !== undefined) hotel.rating = rating;

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

    if (hotel.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this hotel' });
    }

    await hotel.remove();

    return res.status(200).json({ success: true, message: 'Hotel deleted' });
  } catch (error) {
    console.error('Delete hotel error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};