import jwt from 'jsonwebtoken';
import Booking from '../models/booking.model.js';
import Room from '../models/room.model.js';
import LoyaltyAccount from '../models/loyalty.model.js';

// @desc    Create booking with loyalty points calculation
// @route   POST /api/bookings
// @access  Private (guest)
export const createBooking = async (req, res) => {
  try {
    const { RoomID, CheckInDate, CheckOutDate, NumberOfRooms, Status, Amount, PaymentMethod, RedemptionPointsUsed } = req.body;
    const numberOfRooms = NumberOfRooms || 1;

    if (!RoomID || !CheckInDate || !CheckOutDate) {
      return res.status(400).json({ success: false, message: 'RoomID, CheckInDate and CheckOutDate are required' });
    }

    // Validate redemption points if provided
    if (RedemptionPointsUsed && RedemptionPointsUsed > 500) {
      return res.status(400).json({ success: false, message: 'Maximum 500 redemption points can be used at once' });
    }

    const room = await Room.findById(RoomID);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    if (!room.Availability) {
      return res.status(400).json({ success: false, message: 'Room is not available' });
    }

    // Calculate redemption discount (1 point = 10 rupees)
    const redemptionDiscountAmount = RedemptionPointsUsed ? RedemptionPointsUsed * 10 : 0;

    // Create booking with pending status
    const booking = await Booking.create({
      UserID: req.user.id,
      RoomID,
      NumberOfRooms: numberOfRooms,
      CheckInDate,
      CheckOutDate,
      Status: 'pending',
      RedemptionPointsUsed: RedemptionPointsUsed || 0,
      RedemptionDiscountAmount: redemptionDiscountAmount
    });

    // Note: Loyalty points are added in the payment controller when payment is confirmed
    // to avoid double counting

    // Mark room as unavailable (in a real system, you might track individual room instances)
    room.Availability = false;
    await room.save();

    return res.status(201).json({ 
      success: true, 
      data: booking,
      message: 'Booking created successfully' 
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
// @route   PUT /api/bookings/:id/cancel
// @access  Private (user can cancel their own booking)
export const cancelBooking = async (req, res) => {
  try {
    // Extract user from token manually
    let user = null;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smart_hotel_booking_system');
        user = { id: decoded.id, role: decoded.role };
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('RoomID')
      .populate('UserID', 'Name Email');
      
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check if user is authorized (owner or admin)
    if (user.role !== 'admin' && booking.UserID.toString() !== user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled (must be before 1 day of check-in)
    const checkInDate = new Date(booking.CheckInDate);
    const currentDate = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const timeUntilCheckIn = checkInDate.getTime() - currentDate.getTime();

    if (timeUntilCheckIn < oneDayInMs) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel booking. Cancellations must be made at least 1 day before check-in date.' 
      });
    }

    // Check if booking is already cancelled
    if (booking.Status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking is already cancelled' 
      });
    }

    // Update booking status to cancelled
    booking.Status = 'cancelled';
    await booking.save();

    // Make room available again
    const room = await Room.findById(booking.RoomID);
    if (room) {
      room.Availability = true;
      await room.save();
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get single booking with full details
// @route   GET /api/bookings/:id/details
// @access  Private
export const getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'RoomID',
        populate: {
          path: 'HotelID',
          select: 'Name Location Address Image Rating Description'
        }
      })
      .populate('UserID', 'Name Email ContactNumber')
      .populate('PaymentID');
      
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check if user is authorized (owner or admin)
    if (req.user.role !== 'admin' && booking.UserID._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    // Calculate total nights and price
    const checkIn = new Date(booking.CheckInDate);
    const checkOut = new Date(booking.CheckOutDate);
    const totalNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomPrice = booking.RoomID?.Price || 0;
    const totalPrice = roomPrice * totalNights * booking.NumberOfRooms;

    // Check if cancellation is allowed
    const currentDate = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const timeUntilCheckIn = checkIn.getTime() - currentDate.getTime();
    const canCancel = timeUntilCheckIn >= oneDayInMs && booking.Status !== 'cancelled';

    const responseData = {
      _id: booking._id,
      bookingID: booking.BookingID,
      status: booking.Status,
      numberOfRooms: booking.NumberOfRooms,
      checkInDate: booking.CheckInDate,
      checkOutDate: booking.CheckOutDate,
      totalNights,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      canCancel,
      user: {
        name: booking.UserID?.Name || booking.UserID?.name,
        email: booking.UserID?.Email || booking.UserID?.email,
        phone: booking.UserID?.ContactNumber || booking.UserID?.contactNumber
      },
      room: {
        type: booking.RoomID?.Type,
        price: roomPrice,
        features: booking.RoomID?.Features,
        image: booking.RoomID?.Image
      },
      hotel: {
        name: booking.RoomID?.HotelID?.Name,
        location: booking.RoomID?.HotelID?.Location,
        address: booking.RoomID?.HotelID?.Address,
        image: booking.RoomID?.HotelID?.Image,
        rating: booking.RoomID?.HotelID?.Rating,
        description: booking.RoomID?.HotelID?.Description
      },
      payment: booking.PaymentID ? {
        method: booking.PaymentID.PaymentMethod,
        amount: booking.PaymentID.Amount,
        status: booking.PaymentID.Status,
        transactionId: booking.PaymentID.TransactionID,
        date: booking.PaymentID.createdAt
      } : null,
      totalPrice
    };

    return res.status(200).json({ 
      success: true, 
      data: responseData
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
