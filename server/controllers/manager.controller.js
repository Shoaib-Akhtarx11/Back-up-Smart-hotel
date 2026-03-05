
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Hotel from '../models/hotel.model.js';
import Room from '../models/room.model.js';
import Booking from '../models/booking.model.js';
import Review from '../models/review.model.js';

// @desc    Get current manager profile (simplified - no Manager collection)
// @route   GET /api/managers/me
// @access  Private (manager)
export const getCurrentManager = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find hotel managed by this user
    const hotel = await Hotel.findOne({ ManagerID: userObjectId })
      .populate('ManagerID', 'Name Email ContactNumber Role');

    if (!hotel) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No hotel assigned to this manager'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: userId,
        ManagerID: hotel.ManagerID,
        HotelID: hotel,
        Status: 'active'
      }
    });
  } catch (error) {
    console.error('Get current manager error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get all dashboard data for manager (simplified - no Manager collection)
// @route   GET /api/managers/dashboard-data
// @access  Private (manager)
export const getManagerDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get current user info
    const currentUser = await User.findById(userId).select('Name Email Role');
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find all hotels managed by this user (ManagerID in Hotel = User._id)
    const hotels = await Hotel.find({ ManagerID: userObjectId });
    const hotelIds = hotels.map(h => h._id);

    // If no hotels found, return empty data
    if (hotelIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          user: currentUser,
          hotels: [],
          rooms: [],
          bookings: [],
          reviews: [],
          statistics: {
            totalHotels: 0,
            totalRooms: 0,
            totalBookings: 0,
            confirmedBookings: 0,
            pendingBookings: 0,
            cancelledBookings: 0,
            totalRevenue: 0,
            totalReviews: 0,
            averageRating: 0
          }
        }
      });
    }

    // Get rooms for manager's hotels
    const rooms = await Room.find({ HotelID: { $in: hotelIds } })
      .populate('HotelID', 'Name Location Rating');
    const roomIds = rooms.map(r => r._id);

    // Get bookings for manager's rooms
    const bookings = await Booking.find({ RoomID: { $in: roomIds } })
      .populate({
        path: 'RoomID',
        populate: { path: 'HotelID', select: 'Name Location' }
      })
      .populate('UserID', 'Name Email ContactNumber')
      .sort({ createdAt: -1 });

    // Get reviews for manager's hotels
    const reviews = await Review.find({ HotelID: { $in: hotelIds } })
      .populate('UserID', 'Name')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalHotels = hotels.length;
    const totalRooms = rooms.length;
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => 
      b.Status === 'confirmed' || b.Status === 'Confirmed' || b.Status === 'success'
    ).length;
    const pendingBookings = bookings.filter(b => 
      b.Status === 'pending' || b.Status === 'Pending'
    ).length;
    const cancelledBookings = bookings.filter(b => 
      b.Status === 'cancelled' || b.Status === 'Cancelled'
    ).length;

    // Calculate total revenue from confirmed bookings
    let totalRevenue = 0;
    bookings
      .filter(b => b.Status === 'confirmed' || b.Status === 'Confirmed' || b.Status === 'success')
      .forEach(booking => {
        if (booking.RoomID && booking.CheckInDate && booking.CheckOutDate) {
          const nights = Math.ceil(
            (new Date(booking.CheckOutDate) - new Date(booking.CheckInDate)) / (1000 * 60 * 60 * 24)
          );
          const price = booking.RoomID.Price || 0;
          totalRevenue += price * nights * (booking.NumberOfRooms || 1);
        }
      });

    const totalReviews = reviews.length;
    const averageRating = totalHotels > 0
      ? hotels.reduce((sum, h) => sum + (h.Rating || 0), 0) / totalHotels
      : 0;

    // Format hotels for response
    const hotelsWithRoomCount = hotels.map(hotel => ({
      _id: hotel._id,
      Name: hotel.Name,
      Location: hotel.Location,
      Amenities: hotel.Amenities,
      Rating: hotel.Rating,
      Image: hotel.Image,
      ManagerID: {
        _id: currentUser._id,
        Name: currentUser.Name,
        Email: currentUser.Email
      },
      roomCount: rooms.filter(r => r.HotelID._id.toString() === hotel._id.toString()).length,
      createdAt: hotel.createdAt,
      updatedAt: hotel.updatedAt
    }));

    return res.status(200).json({
      success: true,
      data: {
        user: currentUser,
        hotels: hotelsWithRoomCount,
        rooms: rooms,
        bookings: bookings,
        reviews: reviews,
        statistics: {
          totalHotels,
          totalRooms,
          totalBookings,
          confirmedBookings,
          pendingBookings,
          cancelledBookings,
          totalRevenue,
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10
        }
      }
    });
  } catch (error) {
    console.error('Get manager dashboard data error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get all managers (from User collection)
// @route   GET /api/managers
// @access  Private (admin)
export const getAllManagers = async (req, res) => {
  try {
    // Get all users with manager role
    const managers = await User.find({ Role: 'manager' })
      .select('Name Email ContactNumber Role')
      .lean();

    // For each manager, find their hotel
    const managersWithHotels = await Promise.all(
      managers.map(async (manager) => {
        const hotel = await Hotel.findOne({ ManagerID: manager._id })
          .select('Name Location');
        return {
          ...manager,
          hotel: hotel ? { _id: hotel._id, Name: hotel.Name, Location: hotel.Location } : null
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: managersWithHotels.length,
      data: managersWithHotels
    });
  } catch (error) {
    console.error('Get all managers error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get manager profile by user ID
// @route   GET /api/managers/user/:userId
// @access  Private
export const getManagerByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(userObjectId).select('Name Email ContactNumber Role');
    if (!user || user.Role !== 'manager') {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }

    const hotel = await Hotel.findOne({ ManagerID: userObjectId })
      .select('Name Location Image Rating');

    return res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        hotel: hotel || null
      }
    });
  } catch (error) {
    console.error('Get manager by user ID error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get manager profile by hotel ID
// @route   GET /api/managers/hotel/:hotelId
// @access  Private
export const getManagerByHotelId = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const hotelObjectId = new mongoose.Types.ObjectId(hotelId);

    const hotel = await Hotel.findById(hotelObjectId).populate(
      'ManagerID',
      'Name Email ContactNumber Role'
    );

    if (!hotel || !hotel.ManagerID) {
      return res.status(404).json({ success: false, message: 'Manager not found for this hotel' });
    }

    return res.status(200).json({
      success: true,
      data: hotel.ManagerID
    });
  } catch (error) {
    console.error('Get manager by hotel ID error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Stub functions for compatibility - these operations are now handled differently
export const createManagerProfile = async (req, res) => {
  return res.status(400).json({ 
    success: false, 
    message: 'Manager profile is now automatic. Hotels are linked directly to users.' 
  });
};

export const updateManagerProfile = async (req, res) => {
  return res.status(400).json({ 
    success: false, 
    message: 'Manager profile is now automatic. Use hotel update endpoints instead.' 
  });
};

export const assignHotelToManager = async (req, res) => {
  return res.status(400).json({ 
    success: false, 
    message: 'Hotel assignment is now handled automatically. Use hotel creation or update.' 
  });
};

export const deleteManagerProfile = async (req, res) => {
  return res.status(400).json({ 
    success: false, 
    message: 'Manager deletion not supported. Use hotel deletion or user management instead.' 
  });
};

export const createManagerOnRegistration = async (userId, hotelId) => {
  // No longer needed - hotels link directly to users
  return null;
};

