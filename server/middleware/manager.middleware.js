import Hotel from '../models/hotel.model.js';

// @desc    Verify if user has manager role and has access to any hotel
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

    // Check if user manages any hotel (Hotels now directly reference User._id)
    const hotel = await Hotel.findOne({ ManagerID: req.user.id });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'No hotel assigned to this manager. Please contact administrator.'
      });
    }

    // Attach hotel to request for later use
    req.managerHotel = hotel;
    req.managerHotelId = hotel._id;
    next();
  } catch (error) {
    console.error('Verify manager error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Verify manager owns the hotel they are trying to access
// @access  Private
export const verifyManagerHotelOwnership = async (req, res, next) => {
  try {
    // First check if user has manager role
    if (req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager role required.'
      });
    }

    // Get hotel ID from request params or body
    const hotelId = req.params.hotelId || req.body.hotelId || req.params.id;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: 'Hotel ID is required'
      });
    }

    // Check if the manager owns this specific hotel
    // Hotels now directly reference User._id in ManagerID field
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.'
      });
    }

    // Check if the requesting user is the owner of this hotel OR is an admin
    if (hotel.ManagerID.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage this hotel.'
      });
    }

    // Attach hotel to request
    req.managerHotel = hotel;
    req.managerHotelId = hotel._id;
    next();
  } catch (error) {
    console.error('Verify manager hotel ownership error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

