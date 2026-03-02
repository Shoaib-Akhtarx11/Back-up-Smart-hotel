import Booking from '../models/booking.model.js';
import Room from '../models/room.model.js';

// @desc    Create a new booking (guest)
// @route   POST /api/bookings
// @access  Private (guest)
export const createBooking = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ success: false, message: 'roomId, checkInDate and checkOutDate are required' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    if (!room.availability) {
      return res.status(400).json({ success: false, message: 'Room is not available' });
    }

    const booking = await Booking.create({
      user: req.user.id,
      room: roomId,
      checkInDate,
      checkOutDate,
      status: 'pending',
    });

    // Optionally set room availability to false
    room.availability = false;
    await room.save();

    return res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get bookings (user or admin)
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    }
    const bookings = await Booking.find(filter).populate('room').populate('user', 'name email');
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room').populate('user', 'name email');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update booking status (user can cancel, admin can change)
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }
    const { status, checkInDate, checkOutDate } = req.body;
    if (status) booking.status = status;
    if (checkInDate) booking.checkInDate = checkInDate;
    if (checkOutDate) booking.checkOutDate = checkOutDate;

    await booking.save();
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Update booking error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete booking (user or admin)
// @route   DELETE /api/bookings/:id
// @access  Private
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
    }

    const room = await Room.findById(booking.room);
    if (room) {
      room.availability = true;
      await room.save();
    }
    await booking.remove();
    return res.status(200).json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    console.error('Delete booking error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};