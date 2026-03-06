import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Hotel from '../models/hotel.model.js';
import Room from '../models/room.model.js';
import Booking from '../models/booking.model.js';
import Review from '../models/review.model.js';

// @desc    Get manager dashboard stats (only for manager's hotels)
// @route   GET /api/manager/stats
// @access  Private (manager only)
export const getManagerDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find hotels managed by this user
    const hotels = await Hotel.find({ ManagerID: userObjectId });
    const hotelIds = hotels.map(h => h._id);

    if (hotelIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          hotels: { total: 0, rooms: 0 },
          bookings: { total: 0, confirmed: 0, cancelled: 0, pending: 0 },
          revenue: { total: 0 },
          reviews: { total: 0, averageRating: 0 }
        }
      });
    }

    // Get room count
    const totalRooms = await Room.countDocuments({ HotelID: { $in: hotelIds } });

    // Get booking stats
    const rooms = await Room.find({ HotelID: { $in: hotelIds } }).select('_id');
    const roomIds = rooms.map(r => r._id);

    const [totalBookings, confirmedBookings, cancelledBookings, pendingBookings] = await Promise.all([
      Booking.countDocuments({ RoomID: { $in: roomIds } }),
      Booking.countDocuments({ RoomID: { $in: roomIds }, Status: 'confirmed' }),
      Booking.countDocuments({ RoomID: { $in: roomIds }, Status: 'cancelled' }),
      Booking.countDocuments({ RoomID: { $in: roomIds }, Status: 'pending' })
    ]);

    // Calculate total revenue from confirmed bookings
    const revenueData = await Booking.aggregate([
      { $match: { RoomID: { $in: roomIds }, Status: 'confirmed' } },
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

    // Get review stats
    const totalReviews = await Review.countDocuments({ HotelID: { $in: hotelIds } });
    
    // Calculate average rating
    const ratingData = await Hotel.aggregate([
      { $match: { _id: { $in: hotelIds } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$Rating' }
        }
      }
    ]);

    const averageRating = ratingData[0]?.avgRating || 0;

    return res.status(200).json({
      success: true,
      data: {
        hotels: {
          total: hotels.length,
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
        },
        reviews: {
          total: totalReviews,
          averageRating: Math.round(averageRating * 10) / 10
        }
      }
    });
  } catch (error) {
    console.error('Get manager dashboard stats error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get manager's hotels
// @route   GET /api/manager/hotels
// @access  Private (manager only)
export const getManagerHotels = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const hotels = await Hotel.find({ ManagerID: userObjectId })
      .sort({ createdAt: -1 });

    // Get room count and booking count for each hotel
    const hotelsWithStats = await Promise.all(
      hotels.map(async (hotel) => {
        const roomCount = await Room.countDocuments({ HotelID: hotel._id });
        const rooms = await Room.find({ HotelID: hotel._id }).select('_id');
        const roomIds = rooms.map(r => r._id);
        const bookingCount = await Booking.countDocuments({ RoomID: { $in: roomIds } });
        
        // Calculate revenue for this hotel
        const revenueData = await Booking.aggregate([
          { $match: { RoomID: { $in: roomIds }, Status: 'confirmed' } },
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

        return {
          _id: hotel._id,
          Name: hotel.Name,
          Location: hotel.Location,
          Image: hotel.Image,
          Rating: hotel.Rating,
          Amenities: hotel.Amenities,
          Description: hotel.Description,
          roomCount,
          bookingCount,
          totalRevenue: revenueData[0]?.totalRevenue || 0,
          createdAt: hotel.createdAt,
          updatedAt: hotel.updatedAt
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: hotelsWithStats
    });
  } catch (error) {
    console.error('Get manager hotels error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Add new hotel (manager can add their own hotel)
// @route   POST /api/manager/hotels
// @access  Private (manager only)
export const createManagerHotel = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const hotelData = {
      ...req.body,
      ManagerID: userId
    };

    const hotel = new Hotel(hotelData);
    await hotel.save();

    return res.status(201).json({
      success: true,
      data: hotel,
      message: 'Hotel created successfully'
    });
  } catch (error) {
    console.error('Create manager hotel error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update manager's hotel
// @route   PUT /api/manager/hotels/:id
// @access  Private (manager only)
export const updateManagerHotel = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find hotel and verify ownership
    const hotel = await Hotel.findOne({ _id: req.params.id, ManagerID: userObjectId });

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found or unauthorized' });
    }

    // Update hotel
    Object.assign(hotel, req.body);
    await hotel.save();

    return res.status(200).json({
      success: true,
      data: hotel,
      message: 'Hotel updated successfully'
    });
  } catch (error) {
    console.error('Update manager hotel error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete manager's hotel
// @route   DELETE /api/manager/hotels/:id
// @access  Private (manager only)
export const deleteManagerHotel = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find hotel and verify ownership
    const hotel = await Hotel.findOne({ _id: req.params.id, ManagerID: userObjectId });

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found or unauthorized' });
    }

    // Delete rooms associated with the hotel
    await Room.deleteMany({ HotelID: hotel._id });

    // Delete bookings for those rooms
    const rooms = await Room.find({ HotelID: hotel._id }).select('_id');
    const roomIds = rooms.map(room => room._id);
    await Booking.deleteMany({ RoomID: { $in: roomIds } });

    // Delete reviews for the hotel
    await Review.deleteMany({ HotelID: hotel._id });

    // Delete the hotel
    await Hotel.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: `Hotel ${hotel.Name} has been deleted successfully`
    });
  } catch (error) {
    console.error('Delete manager hotel error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get manager's rooms
// @route   GET /api/manager/rooms
// @access  Private (manager only)
export const getManagerRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find hotels managed by this user
    const hotels = await Hotel.find({ ManagerID: userObjectId }).select('_id');
    const hotelIds = hotels.map(h => h._id);

    if (hotelIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Get rooms for manager's hotels
    const rooms = await Room.find({ HotelID: { $in: hotelIds } })
      .populate('HotelID', 'Name Location')
      .sort({ createdAt: -1 });

    // Get booking count for each room
    const roomsWithStats = await Promise.all(
      rooms.map(async (room) => {
        const bookingCount = await Booking.countDocuments({ RoomID: room._id });
        return {
          _id: room._id,
          Type: room.Type,
          Price: room.Price,
          Capacity: room.Capacity,
          Amenities: room.Amenities,
          Availability: room.Availability,
          Image: room.Image,
          HotelID: room.HotelID,
          bookingCount,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: roomsWithStats
    });
  } catch (error) {
    console.error('Get manager rooms error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Add new room to manager's hotel
// @route   POST /api/manager/rooms
// @access  Private (manager only)
export const createManagerRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Verify hotel belongs to this manager
    const hotel = await Hotel.findOne({ _id: req.body.HotelID, ManagerID: userObjectId });

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found or unauthorized' });
    }

    const room = new Room(req.body);
    await room.save();

    // Populate hotel info for response
    await room.populate('HotelID', 'Name Location');

    return res.status(201).json({
      success: true,
      data: room,
      message: 'Room created successfully'
    });
  } catch (error) {
    console.error('Create manager room error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update manager's room
// @route   PUT /api/manager/rooms/:id
// @access  Private (manager only)
export const updateManagerRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find the room and verify hotel belongs to manager
    const room = await Room.findById(req.params.id).populate('HotelID');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if room's hotel belongs to this manager
    if (room.HotelID.ManagerID.toString() !== userObjectId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Update room
    Object.assign(room, req.body);
    await room.save();

    return res.status(200).json({
      success: true,
      data: room,
      message: 'Room updated successfully'
    });
  } catch (error) {
    console.error('Update manager room error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete manager's room
// @route   DELETE /api/manager/rooms/:id
// @access  Private (manager only)
export const deleteManagerRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find the room and verify hotel belongs to manager
    const room = await Room.findById(req.params.id).populate('HotelID');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if room's hotel belongs to this manager
    if (room.HotelID.ManagerID.toString() !== userObjectId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Delete bookings for this room
    await Booking.deleteMany({ RoomID: room._id });

    // Delete the room
    await Room.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete manager room error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get manager's bookings
// @route   GET /api/manager/bookings
// @access  Private (manager only)
export const getManagerBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find hotels managed by this user
    const hotels = await Hotel.find({ ManagerID: userObjectId }).select('_id');
    const hotelIds = hotels.map(h => h._id);

    if (hotelIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Get rooms for manager's hotels
    const rooms = await Room.find({ HotelID: { $in: hotelIds } }).select('_id');
    const roomIds = rooms.map(r => r._id);

    // Get bookings for manager's rooms
    const bookings = await Booking.find({ RoomID: { $in: roomIds } })
      .populate({
        path: 'RoomID',
        populate: { path: 'HotelID', select: 'Name Location Image' }
      })
      .populate('UserID', 'Name Email ContactNumber')
      .sort({ createdAt: -1 });

    // Transform data
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
      roomId: booking.RoomID?._id || booking.RoomID,
      roomType: booking.RoomID?.Type || 'Unknown',
      roomPrice: booking.RoomID?.Price || 0,
      numberOfRooms: booking.NumberOfRooms,
      checkInDate: booking.CheckInDate,
      checkOutDate: booking.CheckOutDate,
      status: booking.Status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    return res.status(200).json({
      success: true,
      data: transformedBookings
    });
  } catch (error) {
    console.error('Get manager bookings error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update booking status (manager can approve/reject bookings for their hotels)
// @route   PUT /api/manager/bookings/:id/status
// @access  Private (manager only)
export const updateManagerBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find booking
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'RoomID',
        populate: { path: 'HotelID' }
      });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify hotel belongs to this manager
    if (booking.RoomID.HotelID.ManagerID.toString() !== userObjectId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Update booking status
    booking.Status = status;
    await booking.save();

    // Update room availability
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
    console.error('Update manager booking status error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get manager's reviews
// @route   GET /api/manager/reviews
// @access  Private (manager only)
export const getManagerReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find hotels managed by this user
    const hotels = await Hotel.find({ ManagerID: userObjectId }).select('_id');
    const hotelIds = hotels.map(h => h._id);

    if (hotelIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Get reviews for manager's hotels
    const reviews = await Review.find({ HotelID: { $in: hotelIds } })
      .populate('UserID', 'Name')
      .populate('HotelID', 'Name Location')
      .sort({ createdAt: -1 });

    // Transform data
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
    console.error('Get manager reviews error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete manager's review
// @route   DELETE /api/manager/reviews/:id
// @access  Private (manager only)
export const deleteManagerReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find review
    const review = await Review.findById(req.params.id).populate('HotelID');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Verify hotel belongs to this manager
    if (review.HotelID.ManagerID.toString() !== userObjectId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Review.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete manager review error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get manager profile
// @route   GET /api/manager/profile
// @access  Private (manager only)
export const getManagerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-Password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get hotel count for this manager
    const hotelCount = await Hotel.countDocuments({ ManagerID: user._id });

    return res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        hotelCount
      }
    });
  } catch (error) {
    console.error('Get manager profile error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
