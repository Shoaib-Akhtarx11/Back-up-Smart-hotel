import User from '../models/user.model.js';
import Hotel from '../models/hotel.model.js';
import Room from '../models/room.model.js';
import Booking from '../models/booking.model.js';
import Review from '../models/review.model.js';

// @desc    Get all users (admin view - includes all roles)
// @route   GET /api/admin/users
// @access  Private (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-Password');
    
    // Also include count of bookings per user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const bookingCount = await Booking.countDocuments({ UserID: user._id });
        const userObj = user.toObject();
        return {
          ...userObj,
          bookingCount
        };
      })
    );

    return res.status(200).json({ 
      success: true, 
      data: usersWithStats 
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    // If deleting a manager, also delete their hotel and rooms
    if (user.Role === 'manager') {
      const hotel = await Hotel.findOne({ ManagerID: user._id });
      if (hotel) {
        // Delete rooms associated with the hotel
        await Room.deleteMany({ HotelID: hotel._id });
        // Delete the hotel
        await Hotel.findByIdAndDelete(hotel._id);
      }
    }

    // Delete user's bookings
    await Booking.deleteMany({ UserID: user._id });
    
    // Delete user's reviews
    await Review.deleteMany({ UserID: user._id });

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({ 
      success: true, 
      message: `User ${user.Name} has been deleted successfully` 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const validRoles = ['guest', 'manager', 'admin'];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be one of: guest, manager, admin' 
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role' });
    }

    user.Role = role;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.Password;

    return res.status(200).json({ 
      success: true, 
      message: `User role updated to ${role}`,
      data: userResponse
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get all hotels with manager info
// @route   GET /api/admin/hotels
// @access  Private (admin only)
export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({})
      .populate('ManagerID', 'Name Email ContactNumber')
      .sort({ createdAt: -1 });

    // Get room count and booking count for each hotel
    const hotelsWithStats = await Promise.all(
      hotels.map(async (hotel) => {
        const roomCount = await Room.countDocuments({ HotelID: hotel._id });
        const bookingCount = await Booking.countDocuments({
          RoomID: { $in: await Room.find({ HotelID: hotel._id }).select('_id') }
        });
        const hotelObj = hotel.toObject();
        return {
          ...hotelObj,
          manager: hotelObj.ManagerID,
          roomCount,
          bookingCount
        };
      })
    );

    return res.status(200).json({ 
      success: true, 
      data: hotelsWithStats 
    });
  } catch (error) {
    console.error('Get all hotels error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete hotel (admin only)
// @route   DELETE /api/admin/hotels/:id
// @access  Private (admin only)
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Delete rooms associated with the hotel
    await Room.deleteMany({ HotelID: hotel._id });

    // Delete bookings for those rooms
    const rooms = await Room.find({ HotelID: hotel._id }).select('_id');
    const roomIds = rooms.map(room => room._id);
    await Booking.deleteMany({ RoomID: { $in: roomIds } });

    // Delete the hotel
    await Hotel.findByIdAndDelete(req.params.id);

    return res.status(200).json({ 
      success: true, 
      message: `Hotel ${hotel.Name} has been deleted successfully` 
    });
  } catch (error) {
    console.error('Delete hotel error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get all bookings with full details (admin view)
// @route   GET /api/admin/bookings
// @access  Private (admin only)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate({
        path: 'RoomID',
        populate: {
          path: 'HotelID',
          select: 'Name Location Image'
        }
      })
      .populate('UserID', 'Name Email ContactNumber')
      .populate('PaymentID')
      .sort({ createdAt: -1 });

    // Transform data for frontend
    const transformedBookings = bookings.map(booking => ({
      _id: booking._id,
      bookingID: booking.BookingID,
      userId: booking.UserID?._id || booking.UserID,
      userName: booking.UserID?.Name || 'Unknown',
      userEmail: booking.UserID?.Email || 'Unknown',
      userPhone: booking.UserID?.ContactNumber || 'Unknown',
      hotelId: booking.RoomID?.HotelID?._id || booking.RoomID?.HotelID,
      hotelName: booking.RoomID?.HotelID?.Name || 'Unknown Hotel',
      hotelLocation: booking.RoomID?.HotelID?.Location || 'Unknown',
      hotelImage: booking.RoomID?.HotelID?.Image || '',
      roomId: booking.RoomID?._id || booking.RoomID,
      roomType: booking.RoomID?.Type || 'Unknown',
      roomPrice: booking.RoomID?.Price || 0,
      numberOfRooms: booking.NumberOfRooms,
      checkInDate: booking.CheckInDate,
      checkOutDate: booking.CheckOutDate,
      status: booking.Status,
      paymentId: booking.PaymentID?._id || booking.PaymentID,
      paymentStatus: booking.PaymentID?.Status || 'pending',
      paymentMethod: booking.PaymentID?.PaymentMethod || 'N/A',
      paymentAmount: booking.PaymentID?.Amount || 0,
      loyaltyPointsEarned: Math.floor((booking.RoomID?.Price || 0) * 0.1),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    return res.status(200).json({ 
      success: true, 
      data: transformedBookings 
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update booking status (admin can approve/reject any booking)
// @route   PUT /api/admin/bookings/:id/status
// @access  Private (admin only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be one of: pending, confirmed, cancelled, completed' 
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'RoomID',
        populate: { path: 'HotelID' }
      });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Update booking status
    booking.Status = status;
    await booking.save();

    // If confirmed, mark room as unavailable; if cancelled, make room available again
    const room = await Room.findById(booking.RoomID);
    if (room) {
      if (status === 'confirmed') {
        room.Availability = false;
      } else if (status === 'cancelled') {
        room.Availability = true;
      }
      await room.save();
    }

    // Populate for response
    await booking.populate('UserID', 'Name Email');
    await booking.populate({
      path: 'RoomID',
      populate: { path: 'HotelID', select: 'Name' }
    });

    return res.status(200).json({ 
      success: true, 
      data: booking,
      message: `Booking ${status} successfully` 
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get most booked hotels (analytics)
// @route   GET /api/admin/analytics/most-booked
// @access  Private (admin only)
export const getMostBookedHotels = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Aggregate bookings to count by hotel
    const hotelBookings = await Booking.aggregate([
      {
        $lookup: {
          from: 'rooms',
          localField: 'RoomID',
          foreignField: '_id',
          as: 'room'
        }
      },
      { $unwind: '$room' },
      {
        $lookup: {
          from: 'hotels',
          localField: 'room.HotelID',
          foreignField: '_id',
          as: 'hotel'
        }
      },
      { $unwind: '$hotel' },
      {
        $group: {
          _id: '$hotel._id',
          hotelName: { $first: '$hotel.Name' },
          hotelLocation: { $first: '$hotel.Location' },
          hotelImage: { $first: '$hotel.Image' },
          hotelRating: { $first: '$hotel.Rating' },
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$Status', 'confirmed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$Status', 'cancelled'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $multiply: ['$room.Price', '$NumberOfRooms'] }
          }
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: limit }
    ]);

    // Get room count for each hotel
    const hotelsWithRooms = await Promise.all(
      hotelBookings.map(async (hotel) => {
        const roomCount = await Room.countDocuments({ HotelID: hotel._id });
        return {
          ...hotel,
          roomCount,
          averagePrice: hotel.totalBookings > 0 
            ? Math.round(hotel.totalRevenue / hotel.totalBookings) 
            : 0
        };
      })
    );

    return res.status(200).json({ 
      success: true, 
      data: hotelsWithRooms 
    });
  } catch (error) {
    console.error('Get most booked hotels error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin only)
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalGuests,
      totalManagers,
      totalAdmins,
      totalHotels,
      totalRooms,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      pendingBookings
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ Role: 'guest' }),
      User.countDocuments({ Role: 'manager' }),
      User.countDocuments({ Role: 'admin' }),
      Hotel.countDocuments(),
      Room.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ Status: 'confirmed' }),
      Booking.countDocuments({ Status: 'cancelled' }),
      Booking.countDocuments({ Status: 'pending' })
    ]);

    // Calculate total revenue from confirmed bookings
    const revenueData = await Booking.aggregate([
      { $match: { Status: 'confirmed' } },
      {
        $lookup: {
          from: 'rooms',
          localField: 'RoomID',
          foreignField: '_id',
          as: 'room'
        }
      },
      { $unwind: '$room' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ['$room.Price', '$NumberOfRooms'] } }
        }
      }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    return res.status(200).json({ 
      success: true, 
      data: {
        users: {
          total: totalUsers,
          guests: totalGuests,
          managers: totalManagers,
          admins: totalAdmins
        },
        hotels: {
          total: totalHotels,
          rooms: totalRooms
        },
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings,
          pending: pendingBookings
        },
        revenue: {
          total: totalRevenue
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get all reviews (admin view)
// @route   GET /api/admin/reviews
// @access  Private (admin only)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('UserID', 'Name Email')
      .populate('HotelID', 'Name Location')
      .sort({ createdAt: -1 });

    const transformedReviews = reviews.map(review => ({
      _id: review._id,
      userId: review.UserID?._id || review.UserID,
      userName: review.UserID?.Name || 'Unknown',
      hotelId: review.HotelID?._id || review.HotelID,
      hotelName: review.HotelID?.Name || 'Unknown',
      rating: review.Rating,
      comment: review.Comment,
      date: review.createdAt
    }));

    return res.status(200).json({ 
      success: true, 
      data: transformedReviews 
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete review (admin only)
// @route   DELETE /api/admin/reviews/:id
// @access  Private (admin only)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);

    return res.status(200).json({ 
      success: true, 
      message: 'Review deleted successfully' 
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

