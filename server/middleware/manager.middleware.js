import Manager from '../models/manager.model.js';

// @desc    Verify if user has manager role and has a manager profile
// @access  Private
export const verifyManager = async (req, res, next) => {
  try {
    // First check if user has manager role (already done by auth middleware)
    if (req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager role required.'
      });
    }

    // Check if manager profile exists
    const manager = await Manager.findOne({ ManagerID: req.user.id });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager profile not found. Please contact administrator.'
      });
    }

    // Check if manager is active
    if (manager.Status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your manager account is inactive. Please contact administrator.'
      });
    }

    // Attach manager profile to request
    req.manager = manager;
    next();
  } catch (error) {
    console.error('Verify manager error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Verify manager owns the hotel
// @access  Private
export const verifyManagerHotelOwnership = async (req, res, next) => {
  try {
    // First run verifyManager middleware
    if (req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager role required.'
      });
    }

    const manager = await Manager.findOne({ ManagerID: req.user.id });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager profile not found.'
      });
    }

    if (manager.Status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your manager account is inactive.'
      });
    }

    // Get hotel ID from request params or body
    const hotelId = req.params.hotelId || req.body.hotelId || req.params.id;

    // Check if the manager owns the hotel
    if (hotelId && manager.HotelID.toString() !== hotelId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage this hotel.'
      });
    }

    // Attach manager profile and hotel ID to request
    req.manager = manager;
    req.managerHotelId = manager.HotelID;
    next();
  } catch (error) {
    console.error('Verify manager hotel ownership error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

