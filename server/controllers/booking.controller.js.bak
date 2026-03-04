import Booking from '../models/booking.model.js';
import Room from '../models/room.model.js';
import LoyaltyAccount from '../models/loyalty.model.js';

// @desc    Create booking with loyalty points calculation
// @route   POST /api/bookings
// @access  Private (guest)
export const createBooking = async (req, res) => {
  try {
    const { RoomID, CheckInDate, CheckOutDate } = req.body;

    if (!RoomID || !CheckInDate || !CheckOutDate) {
      return res.status(400).json({ success: false, message: 'RoomID, CheckInDate and CheckOutDate are required' });
    }

    const room = await Room.findById(RoomID);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    if (!room.Availability) {
      return res.status(400).json({ success: false, message: 'Room is not available' });
    }

    // Create booking
    const booking = await Booking.create({
      UserID: req.user.id,
      RoomID,
      CheckInDate,
      CheckOutDate,
      Status: 'pending',
    });

    // Add loyalty points (1 point per 100 rupees spent)
    const pointsEarned = Math.floor(room.Price / 100);
    let loyalty = await LoyaltyAccount.findOne({ UserID: req.user.id });
    if (!loyalty) {
      loyalty = await LoyaltyAccount.create({
        UserID: req.user.id,
        PointsBalance: pointsEarned,
        LastUpdated: new Date(),
      });
    } else {
      loyalty.PointsBalance += pointsEarned;
      loyalty.LastUpdated = new Date();
      await loyalty.save();
    }

    // Mark room as unavailable
    room.Availability = false;
    await room.save();

    return res.status(201).json({ 
      success: true, 
      data: booking,
      pointsEarned,
      message: `Booking created! You earned ${pointsEarned} loyalty points` 
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get bookings
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') {
      filter.UserID = req.user.id;
    }
    const bookings = await Booking.find(filter)
      .populate('RoomID', 'Type Price HotelID')
      .populate('RoomID.HotelID', 'Name Location')
      .populate('UserID', 'Name Email');
      
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
    const booking = await Booking.findById(req.params.id)
      .populate('RoomID')
      .populate('UserID', 'Name Email ContactNumber');
      
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (req.user.role !== 'admin' && booking.UserID._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (req.user.role !== 'admin' && booking.UserID.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { Status, CheckInDate, CheckOutDate } = req.body;
    if (Status) booking.Status = Status;
    if (CheckInDate) booking.CheckInDate = CheckInDate;
    if (CheckOutDate) booking.CheckOutDate = CheckOutDate;

    await booking.save();
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Update booking error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (req.user.role !== 'admin' && booking.UserID.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const room = await Room.findById(booking.RoomID);
    if (room) {
      room.Availability = true;
      await room.save();
    }
    
    await Booking.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    console.error('Delete booking error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
