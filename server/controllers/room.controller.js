import Room from '../models/room.model.js';
import Hotel from '../models/hotel.model.js';

// @desc    Create room under a hotel (manager/admin)
// @route   POST /api/rooms
// @access  Private (manager/admin)
export const createRoom = async (req, res) => {
  try {
    const { hotelId, type, price, availability, features } = req.body;

    if (!hotelId || !type || price === undefined) {
      return res.status(400).json({ success: false, message: 'hotelId, type and price are required' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    if (hotel.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add room to this hotel' });
    }

    const room = await Room.create({
      hotel: hotelId,
      type,
      price,
      availability: availability !== undefined ? availability : true,
      features,
    });

    return res.status(201).json({ success: true, data: room });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get all rooms (public, with optional hotel filter)
// @route   GET /api/rooms
// @access  Public
export const getRooms = async (req, res) => {
  try {
    const { hotelId } = req.query;
    const filter = hotelId ? { hotel: hotelId } : {};
    const rooms = await Room.find(filter).populate('hotel', 'name location');
    return res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
export const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel', 'name location');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    return res.status(200).json({ success: true, data: room });
  } catch (error) {
    console.error('Get room error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update room (manager/admin)
// @route   PUT /api/rooms/:id
// @access  Private (manager/admin)
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.hotel.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this room' });
    }

    const { type, price, availability, features } = req.body;
    if (type) room.type = type;
    if (price !== undefined) room.price = price;
    if (availability !== undefined) room.availability = availability;
    if (features) room.features = features;

    await room.save();
    return res.status(200).json({ success: true, data: room });
  } catch (error) {
    console.error('Update room error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete room (manager/admin)
// @route   DELETE /api/rooms/:id
// @access  Private (manager/admin)
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.hotel.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this room' });
    }

    await room.remove();
    return res.status(200).json({ success: true, message: 'Room deleted' });
  } catch (error) {
    console.error('Delete room error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};