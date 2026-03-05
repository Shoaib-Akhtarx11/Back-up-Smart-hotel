import mongoose from 'mongoose';
import Manager from '../models/manager.model.js';
import User from '../models/user.model.js';
import Hotel from '../models/hotel.model.js';
import Room from '../models/room.model.js';
import Booking from '../models/booking.model.js';
import Review from '../models/review.model.js';

// @desc    Create manager profile
// @route   POST /api/managers
// @access  Private (manager)
export const createManagerProfile = async (req, res) => {
  try {
    const { HotelID } = req.body;
    const userId = req.user.id;

    // Check if user exists and has manager role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.Role !== 'manager') {
      return res.status(403).json({ success: false, message: 'Only managers can create manager profiles' });
    }

    // Check if hotel exists
    const hotel = await Hotel.findById(HotelID);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Check if manager profile already exists for this hotel
    const existingManager = await Manager.findOne({ HotelID });
    if (existingManager) {
      return res.status(400).json({ success: false, message: 'Manager profile already exists for this hotel' });
    }

    // Check if this user is already a manager for another hotel
    const existingUserManager = await Manager.findOne({ ManagerID: userId });
    if (existingUserManager) {
      return res.status(400).json({ success: false, message: 'You are already assigned to another hotel' });
    }

    // Create manager profile
    const manager = await Manager.create({
      ManagerID: userId,
      HotelID,
      DateAssigned: Date.now(),
      Status: 'active'
    });

    // Populate the response
    await manager.populate([
      { path: 'ManagerID', select: 'Name Email ContactNumber' },
      { path: 'HotelID', select: 'Name Location' }
    ]);

    return res.status(201).json({
      success: true,
      message: 'Manager profile created successfully',
      data: manager
    });
  } catch (error) {
    console.error('Create manager profile error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get manager profile by user ID
// @route   GET /api/managers/user/:userId
// @access  Private
export const getManagerByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const manager = await Manager.findOne({ ManagerID: userId }).populate([
      { path: 'ManagerID', select: 'Name Email ContactNumber Role' },
      { path: 'HotelID', select: 'Name Location Image Rating' }
    ]);

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager profile not found' });
    }

    return res.status(200).json({
      success: true,
      data: manager
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

    const manager = await Manager.findOne({ HotelID: hotelId }).populate([
      { path: 'ManagerID', select: 'Name Email ContactNumber Role' },
      { path: 'HotelID', select: 'Name Location Image Rating' }
    ]);

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager profile not found for this hotel' });
    }

    return res.status(200).json({
      success: true,
      data: manager
    });
  } catch (error) {
    console.error('Get manager by hotel ID error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get all managers
// @route   GET /api/managers
// @access  Private (admin)
export const getAllManagers = async (req, res) => {
  try {
    const managers = await Manager.find().populate([
      { path: 'ManagerID', select: 'Name Email ContactNumber Role' },
      { path: 'HotelID', select: 'Name Location Image Rating' }
    ]);

    return res.status(200).json({
      success: true,
      count: managers.length,
      data: managers
    });
  } catch (error) {
    console.error('Get all managers error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get current manager profile
// @route   GET /api/managers/me
// @access  Private (manager)
export const getCurrentManager = async (req, res) => {
  try {
    const userId = req.user.id;

    const manager = await Manager.findOne({ ManagerID: userId }).populate([
      { path: 'ManagerID', select: 'Name Email ContactNumber Role' },
      { path: 'HotelID', select: 'Name Location Image Rating Amenities' }
    ]);

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager profile not found' });
    }

    return res.status(200).json({
      success: true,
      data: manager
    });
  } catch (error) {
    console.error('Get current manager error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update manager profile
// @route   PUT /api/managers/:id
// @access  Private (manager)
export const updateManagerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { Status } = req.body;
    const userId = req.user.id;

    // Find manager profile
    const manager = await Manager.findById(id);

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager profile not found' });
    }

    // Check if the user is the owner of this manager profile
    if (manager.ManagerID.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this manager profile' });
    }

    // Update fields
    if (Status) {
      manager.Status = Status;
    }

    await manager.save();

    // Populate the response
    await manager.populate([
      { path: 'ManagerID', select: 'Name Email ContactNumber' },
      { path: 'HotelID', select: 'Name Location' }
    ]);

    return res.status(200).json({
      success: true,
      message: 'Manager profile updated successfully',
      data: manager
    });
  } catch (error) {
    console.error('Update manager profile error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Assign hotel to manager
// @route   PUT /api/managers/assign-hotel
// @access  Private (admin)
export const assignHotelToManager = async (req, res) => {
  try {
    const { ManagerID, HotelID } = req.body;

    if (!ManagerID || !HotelID) {
      return res.status(400).json({ success: false, message: 'Please provide manager ID and hotel ID' });
    }

    // Check if user exists and has manager role
    const user = await User.findById(ManagerID);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.Role !== 'manager') {
      return res.status(400).json({ success: false, message: 'User must have manager role to be assigned to a hotel' });
    }

    // Check if hotel exists
    const hotel = await Hotel.findById(HotelID);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Check if hotel already has a manager
    const existingHotelManager = await Manager.findOne({ HotelID });
    if (existingHotelManager) {
      return res.status(400).json({ success: false, message: 'This hotel already has a manager assigned' });
    }

    // Check if manager is already assigned to another hotel
    const existingManagerProfile = await Manager.findOne({ ManagerID });
    if (existingManagerProfile) {
      return res.status(400).json({ success: false, message: 'This manager is already assigned to another hotel' });
    }

    // Create manager profile
    const manager = await Manager.create({
      ManagerID,
      HotelID,
      DateAssigned: Date.now(),
      Status: 'active'
    });

    // Also update the hotel's ManagerID
    hotel.ManagerID = ManagerID;
    await hotel.save();

    // Populate the response
    await manager.populate([
      { path: 'ManagerID', select: 'Name Email ContactNumber' },
      { path: 'HotelID', select: 'Name Location' }
    ]);

    return res.status(201).json({
      success: true,
      message: 'Hotel assigned to manager successfully',
      data: manager
    });
  } catch (error) {
    console.error('Assign hotel to manager error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete manager profile
// @route   DELETE /api/managers/:id
// @access  Private (admin)
export const deleteManagerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await Manager.findById(id);

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager profile not found' });
    }

    // Optionally clear the hotel's ManagerID
    await Hotel.findByIdAndUpdate(manager.HotelID, { ManagerID: null });

    await Manager.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Manager profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete manager profile error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Create manager profile automatically when user registers as manager
// @route   POST /api/managers/create-on-register
// @access  Private (called internally from auth controller)
export const createManagerOnRegistration = async (userId, hotelId) => {
  try {
    // Check if manager profile already exists
    const existingManager = await Manager.findOne({ ManagerID: userId });
    if (existingManager) {
      return existingManager;
    }

    // Check if hotel already has a manager
    const existingHotelManager = await Manager.findOne({ HotelID: hotelId });
    if (existingHotelManager) {
      throw new Error('This hotel already has a manager assigned');
    }

    // Create manager profile
    const manager = await Manager.create({
      ManagerID: userId,
      HotelID: hotelId,
      DateAssigned: Date.now(),
      Status: 'active'
    });

    // Update hotel's ManagerID
    await Hotel.findByIdAndUpdate(hotelId, { ManagerID: userId });

    return manager;
  } catch (error) {
    console.error('Create manager on registration error:', error);
    throw error;
  }
};

// @desc    Get all dashboard data for manager using aggregation
// @route   GET /api/managers/dashboard-data
// @access  Private (manager)
export const getManagerDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // First, get all hotels managed by this manager
    // Check both Manager collection and Hotel's ManagerID field
    const managerProfile = await Manager.findOne({ ManagerID: userId });
    
    let hotelIds = [];
    if (managerProfile) {
      hotelIds.push(managerProfile.HotelID);
    }
    
    // Also get hotels where ManagerID matches directly
    const hotelsWhereManager = await Hotel.find({ ManagerID: userId }).select('_id');
    hotelsWhereManager.forEach(h => {
      if (!hotelIds.includes(h._id)) {
        hotelIds.push(h._id);
      }
    });

    // If no hotels found, return empty data
    if (hotelIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
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

    // Use aggregation to get all hotels with their room counts
    const hotelsAggregation = await Hotel.aggregate([
      { $match: { _id: { $in: hotelIds } } },
      {
        $lookup: {
          from: 'rooms',
          localField: '_id',
          foreignField: 'HotelID',
          as: 'rooms'
        }
      },
      {
        $addFields: {
          roomCount: { $size: '$rooms' },
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
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ManagerID',
          foreignField: '_id',
          as: 'managerInfo'
        }
      },
      { $unwind: { path: '$managerInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          Name: 1,
          Location: 1,
          Amenities: 1,
          Rating: 1,
          Image: 1,
          ManagerID: {
            _id: '$managerInfo._id',
            Name: '$managerInfo.Name',
            Email: '$managerInfo.Email',
            ContactNumber: '$managerInfo.ContactNumber'
          },
          roomCount: 1,
          availableRoomsCount: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    // Get all rooms for manager's hotels using aggregation
    const roomsAggregation = await Room.aggregate([
      { $match: { HotelID: { $in: hotelIds } } },
      {
        $lookup: {
          from: 'hotels',
          localField: 'HotelID',
          foreignField: '_id',
          as: 'hotelData'
        }
      },
      { $unwind: { path: '$hotelData', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          HotelID: {
            _id: '$hotelData._id',
            Name: '$hotelData.Name',
            Location: '$hotelData.Location',
            Rating: '$hotelData.Rating'
          },
          Type: 1,
          Price: 1,
          Availability: 1,
          Features: 1,
          image: '$Image',
          RoomID: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    // Get all bookings for manager's rooms
    const roomIds = roomsAggregation.map(r => r._id);
    const bookingsAggregation = await Booking.aggregate([
      { $match: { RoomID: { $in: roomIds } } },
      {
        $lookup: {
          from: 'rooms',
          localField: 'RoomID',
          foreignField: '_id',
          as: 'roomData'
        }
      },
      { $unwind: { path: '$roomData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'hotels',
          localField: 'roomData.HotelID',
          foreignField: '_id',
          as: 'hotelData'
        }
      },
      { $unwind: { path: '$hotelData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'UserID',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'payments',
          localField: 'PaymentID',
          foreignField: '_id',
          as: 'paymentData'
        }
      },
      { $unwind: { path: '$paymentData', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          BookingID: 1,
          UserID: {
            _id: '$userData._id',
            Name: '$userData.Name',
            Email: '$userData.Email',
            ContactNumber: '$userData.ContactNumber'
          },
          RoomID: {
            _id: '$roomData._id',
            Type: '$roomData.Type',
            Price: '$roomData.Price',
            HotelID: {
              _id: '$hotelData._id',
              Name: '$hotelData.Name',
              Location: '$hotelData.Location'
            }
          },
          NumberOfRooms: 1,
          CheckInDate: 1,
          CheckOutDate: 1,
          Status: 1,
          PaymentID: 1,
          createdAt: 1,
          updatedAt: 1,
          totalPrice: {
            $multiply: [
              '$roomData.Price',
              {
                $divide: [
                  { $subtract: [new Date('$CheckOutDate'), new Date('$CheckInDate')] },
                  1000 * 60 * 60 * 24
                ]
              }
            ]
          }
        }
      }
    ]);

    // Get reviews for manager's hotels
    const reviewsAggregation = await Review.aggregate([
      { $match: { HotelID: { $in: hotelIds } } },
      {
        $lookup: {
          from: 'users',
          localField: 'UserID',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'hotels',
          localField: 'HotelID',
          foreignField: '_id',
          as: 'hotelData'
        }
      },
      { $unwind: { path: '$hotelData', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          Rating: 1,
          Comment: 1,
          HotelID: {
            _id: '$hotelData._id',
            Name: '$hotelData.Name'
          },
          UserID: {
            _id: '$userData._id',
            Name: '$userData.Name'
          },
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    // Calculate statistics
    const totalHotels = hotelsAggregation.length;
    const totalRooms = roomsAggregation.length;
    const totalBookings = bookingsAggregation.length;
    const confirmedBookings = bookingsAggregation.filter(b => 
      b.Status === 'confirmed' || b.Status === 'Confirmed' || b.Status === 'success'
    ).length;
    const pendingBookings = bookingsAggregation.filter(b => 
      b.Status === 'pending' || b.Status === 'Pending'
    ).length;
    const cancelledBookings = bookingsAggregation.filter(b => 
      b.Status === 'cancelled' || b.Status === 'Cancelled'
    ).length;
    
    // Calculate total revenue from confirmed bookings (sum of payment amounts)
    const confirmedBookingIds = bookingsAggregation
      .filter(b => b.Status === 'confirmed' || b.Status === 'Confirmed' || b.Status === 'success')
      .map(b => b._id);
    
    // Get payments for confirmed bookings
    const payments = await import('../models/payment.model.js').then(m => 
      m.default.find({ BookingID: { $in: confirmedBookingIds }, Status: 'success' }).select('Amount')
    ).catch(() => []);
    
    let totalRevenue = 0;
    if (payments && payments.length > 0) {
      totalRevenue = payments.reduce((sum, p) => sum + (p.Amount || 0), 0);
    }
    
    // If payments not available, calculate from room prices
    if (totalRevenue === 0) {
      totalRevenue = bookingsAggregation
        .filter(b => b.Status === 'confirmed' || b.Status === 'Confirmed' || b.Status === 'success')
        .reduce((sum, b) => {
          const nights = Math.ceil((new Date(b.CheckOutDate) - new Date(b.CheckInDate)) / (1000 * 60 * 60 * 24));
          const price = b.RoomID?.Price || 0;
          return sum + (price * nights * (b.NumberOfRooms || 1));
        }, 0);
    }

    const totalReviews = reviewsAggregation.length;
    const averageRating = totalReviews > 0
      ? hotelsAggregation.reduce((sum, h) => sum + (h.Rating || 0), 0) / totalHotels
      : 0;

    // Populate manager info for the response
    const managerInfo = managerProfile ? await Manager.findById(managerProfile._id)
      .populate('ManagerID', 'Name Email ContactNumber Role')
      .populate('HotelID', 'Name Location') : null;

    return res.status(200).json({
      success: true,
      data: {
        manager: managerInfo,
        hotels: hotelsAggregation,
        rooms: roomsAggregation,
        bookings: bookingsAggregation,
        reviews: reviewsAggregation,
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

