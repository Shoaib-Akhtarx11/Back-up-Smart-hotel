import Redemption from '../models/redemption.model.js';
import LoyaltyAccount from '../models/loyalty.model.js';
import Booking from '../models/booking.model.js';

// @desc    Redeem loyalty points for booking discount
// @route   POST /api/redemptions
// @access  Private (guest)
export const createRedemption = async (req, res) => {
  try {
    const { BookingID, PointsUsed } = req.body;

    if (!BookingID || !PointsUsed) {
      return res.status(400).json({ success: false, message: 'BookingID and PointsUsed are required' });
    }

    // Check loyalty account
    const account = await LoyaltyAccount.findOne({ UserID: req.user.id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Loyalty account not found' });
    }
    if (account.PointsBalance < PointsUsed) {
      return res.status(400).json({ success: false, message: 'Insufficient points. You have ' + account.PointsBalance + ' points' });
    }

    // Calculate discount (1 point = 10 rupees discount)
    const DiscountAmount = PointsUsed * 10;

    // Deduct points
    account.PointsBalance -= PointsUsed;
    account.LastUpdated = new Date();
    await account.save();

    // Create redemption record
    const redemption = await Redemption.create({
      UserID: req.user.id,
      BookingID,
      PointsUsed,
      DiscountAmount,
      CreatedAt: new Date(),
    });

    return res.status(201).json({ 
      success: true, 
      data: redemption,
      message: `Redemption successful! You got ${DiscountAmount} rupees discount` 
    });
  } catch (error) {
    console.error('Create redemption error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get user's redemptions
// @route   GET /api/redemptions
// @access  Private
export const getRedemptions = async (req, res) => {
  try {
    let filter = {};
    if (req.user.Role !== 'admin') {
      filter.UserID = req.user.id;
    }
    const redemptions = await Redemption.find(filter)
      .populate('BookingID', 'CheckInDate CheckOutDate Status')
      .populate('UserID', 'Name Email')
      .sort({ CreatedAt: -1 });

    return res.status(200).json({ success: true, data: redemptions });
  } catch (error) {
    console.error('Get redemptions error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get single redemption
// @route   GET /api/redemptions/:id
// @access  Private
export const getRedemption = async (req, res) => {
  try {
    const redemption = await Redemption.findById(req.params.id)
      .populate('BookingID')
      .populate('UserID', 'Name Email ContactNumber');

    if (!redemption) {
      return res.status(404).json({ success: false, message: 'Redemption not found' });
    }
    if (req.user.Role !== 'admin' && redemption.UserID._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    return res.status(200).json({ success: true, data: redemption });
  } catch (error) {
    console.error('Get redemption error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete redemption (admin only)
// @route   DELETE /api/redemptions/:id
// @access  Private (admin)
export const deleteRedemption = async (req, res) => {
  try {
    if (req.user.Role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const redemption = await Redemption.findById(req.params.id);
    if (!redemption) {
      return res.status(404).json({ success: false, message: 'Redemption not found' });
    }

    await Redemption.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Redemption deleted' });
  } catch (error) {
    console.error('Delete redemption error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};