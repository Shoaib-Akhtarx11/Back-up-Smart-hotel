import Redemption from '../models/redemption.model.js';
import LoyaltyAccount from '../models/loyalty.model.js';

// @desc    Create redemption (guest)
// @route   POST /api/redemptions
// @access  Private (guest)
export const createRedemption = async (req, res) => {
  try {
    const { bookingId, pointsUsed, discountAmount } = req.body;
    if (!bookingId || pointsUsed === undefined || discountAmount === undefined) {
      return res.status(400).json({ success: false, message: 'bookingId, pointsUsed and discountAmount are required' });
    }
    const account = await LoyaltyAccount.findOne({ user: req.user.id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Loyalty account not found' });
    }
    if (account.pointsBalance < pointsUsed) {
      return res.status(400).json({ success: false, message: 'Insufficient points' });
    }
    account.pointsBalance -= pointsUsed;
    account.lastUpdated = Date.now();
    await account.save();

    const redemption = await Redemption.create({
      user: req.user.id,
      booking: bookingId,
      pointsUsed,
      discountAmount,
    });
    return res.status(201).json({ success: true, data: redemption });
  } catch (error) {
    console.error('Create redemption error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get redemptions (user or admin)
// @route   GET /api/redemptions
// @access  Private
export const getRedemptions = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    }
    const redemptions = await Redemption.find(filter);
    return res.status(200).json({ success: true, data: redemptions });
  } catch (error) {
    console.error('Get redemptions error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete redemption (admin)
// @route   DELETE /api/redemptions/:id
// @access  Private (admin)
export const deleteRedemption = async (req, res) => {
  try {
    const redemption = await Redemption.findById(req.params.id);
    if (!redemption) {
      return res.status(404).json({ success: false, message: 'Redemption not found' });
    }
    await redemption.remove();
    return res.status(200).json({ success: true, message: 'Redemption deleted' });
  } catch (error) {
    console.error('Delete redemption error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};