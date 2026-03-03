import Room from '../models/room.model.js';
import Hotel from '../models/hotel.model.js';

// @desc    Create room under a hotel (manager/admin)
// @route   POST /api/rooms
// @access  Private (manager/admin)
export const createRoom = async (req, res) => {
  try {
    const { HotelID, Type, Price, Features } = req.body;

    if (!HotelID || !Type || Price === undefined) {
      return res.status(400).json({ success: false, message: 'HotelID, Type and Price are required' });
    }

    const hotel = await Hotel.findById(HotelID);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    if (hotel.ManagerID.toString() !== req.user.id && req.user.Role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add room to this hotel' });
    }

    const room = await Room.create({
      HotelID,
      Type,
      Price,
      Availability: true,
      Features: Features || [],
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
    const { HotelID } = req.query;
    const filter = HotelID ? { HotelID } : {};
    const rooms = await Room.find(filter).populate('HotelID', 'Name Location Rating');
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
    const room = await Room.findById(req.params.id).populate('HotelID', 'Name Location Rating Amenities');
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
    const room = await Room.findById(req.params.id).populate('HotelID');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.HotelID.ManagerID.toString() !== req.user.id && req.user.Role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this room' });
    }

    const { Type, Price, Availability, Features } = req.body;
    if (Type) room.Type = Type;
    if (Price !== undefined) room.Price = Price;
    if (Availability !== undefined) room.Availability = Availability;
    if (Features) room.Features = Features;

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
    const room = await Room.findById(req.params.id).populate('HotelID');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.HotelID.ManagerID.toString() !== req.user.id && req.user.Role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this room' });
    }

    await Room.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};