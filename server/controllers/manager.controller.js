import Manager from '../models/manager.model.js';
import User from '../models/user.model.js';
import Hotel from '../models/hotel.model.js';

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

