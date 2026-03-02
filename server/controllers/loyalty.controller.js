import LoyaltyAccount from '../models/loyalty.model.js';

// @desc    Get loyalty account for current user
// @route   GET /api/loyalty
// @access  Private
export const getLoyalty = async (req, res) => {
  try {
    const account = await LoyaltyAccount.findOne({ user: req.user.id });
    return res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error('Get loyalty error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update points balance (internal use)
// @route   PUT /api/loyalty/:id
// @access  Private (admin)
export const updateLoyalty = async (req, res) => {
  try {
    const account = await LoyaltyAccount.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Loyalty account not found' });
    }
    const { pointsBalance } = req.body;
    if (pointsBalance !== undefined) account.pointsBalance = pointsBalance;
    account.lastUpdated = Date.now();
    await account.save();
    return res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error('Update loyalty error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Create or get loyalty account (on registration or first booking)
// @route   POST /api/loyalty
// @access  Private
export const createLoyalty = async (req, res) => {
  try {
    let account = await LoyaltyAccount.findOne({ user: req.user.id });
    if (!account) {
      account = await LoyaltyAccount.create({ user: req.user.id });
    }
    return res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error('Create loyalty error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
