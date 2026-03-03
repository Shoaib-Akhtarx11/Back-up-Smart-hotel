import LoyaltyAccount from '../models/loyalty.model.js';

// @desc    Get loyalty account for current user
// @route   GET /api/loyalty/:userId
// @access  Private
export const getLoyalty = async (req, res) => {
  try {
    const account = await LoyaltyAccount.findOne({ UserID: req.params.userId || req.user.id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Loyalty account not found' });
    }
    return res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error('Get loyalty error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get loyalty history
// @route   GET /api/loyalty/history/:userId
// @access  Private
export const getLoyaltyHistory = async (req, res) => {
  try {
    const account = await LoyaltyAccount.findOne({ UserID: req.params.userId || req.user.id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Loyalty account not found' });
    }
    return res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error('Get loyalty history error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update loyalty points (internal - called by payment/booking)
// @route   PUT /api/loyalty/:userId
// @access  Private (internal)
export const updateLoyalty = async (req, res) => {
  try {
    const { PointsBalance } = req.body;
    const account = await LoyaltyAccount.findOne({ UserID: req.params.userId });
    
    if (!account) {
      const newAccount = await LoyaltyAccount.create({
        UserID: req.params.userId,
        PointsBalance: PointsBalance || 0,
        LastUpdated: new Date(),
      });
      return res.status(201).json({ success: true, data: newAccount });
    }

    if (PointsBalance !== undefined) account.PointsBalance = PointsBalance;
    account.LastUpdated = new Date();
    await account.save();
    return res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error('Update loyalty error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Add points to loyalty account
// @route   POST /api/loyalty/add-points
// @access  Private (internal)
export const addPoints = async (req, res) => {
  try {
    const { UserID, Points } = req.body;

    if (!UserID || Points === undefined) {
      return res.status(400).json({ success: false, message: 'UserID and Points are required' });
    }

    let account = await LoyaltyAccount.findOne({ UserID });
    if (!account) {
      account = await LoyaltyAccount.create({
        UserID,
        PointsBalance: Points,
        LastUpdated: new Date(),
      });
    } else {
      account.PointsBalance += Points;
      account.LastUpdated = new Date();
      await account.save();
    }

    return res.status(200).json({ success: true, data: account, message: `${Points} points added!` });
  } catch (error) {
    console.error('Add points error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
