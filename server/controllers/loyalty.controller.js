import LoyaltyAccount from '../models/loyalty.model.js';

// @desc    Get loyalty account for current user
// @route   GET /api/loyalty/:userId or GET /api/loyalty/me
// @access  Private
export const getLoyalty = async (req, res) => {
  try {
    // If userId param is 'me', use current user id, otherwise use the param
    const userId = req.params.userId === 'me' ? req.user.id : (req.params.userId || req.user.id);
    const account = await LoyaltyAccount.findOne({ UserID: userId });
    if (!account) {
      // Return default account if not found
      return res.status(200).json({ 
        success: true, 
        data: {
          PointsBalance: 0,
          RedemptionPointsBalance: 0,
          History: [],
          LastUpdated: new Date()
        }
      });
    }
    return res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error('Get loyalty error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get loyalty history
// @route   GET /api/loyalty/history/:userId or GET /api/loyalty/history/me
// @access  Private
export const getLoyaltyHistory = async (req, res) => {
  try {
    const userId = req.params.userId === 'me' ? req.user.id : (req.params.userId || req.user.id);
    const account = await LoyaltyAccount.findOne({ UserID: userId });
    if (!account) {
      return res.status(200).json({ 
        success: true, 
        data: {
          PointsBalance: 0,
          RedemptionPointsBalance: 0,
          History: []
        }
      });
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
        RedemptionPointsBalance: 0,
        History: [{
          type: 'earned',
          Points: Points,
          Description: 'Points added',
          Date: new Date()
        }],
        LastUpdated: new Date(),
      });
    } else {
      account.PointsBalance += Points;
      account.History.push({
        type: 'earned',
        Points: Points,
        Description: 'Points added',
        Date: new Date()
      });
      account.LastUpdated = new Date();
      await account.save();
    }

    return res.status(200).json({ success: true, data: account, message: `${Points} points added!` });
  } catch (error) {
    console.error('Add points error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Purchase redemption points with loyalty points (1:1 ratio)
// @route   POST /api/loyalty/purchase-redemption
// @access  Private
export const purchaseRedemptionPoints = async (req, res) => {
  try {
    const { Points } = req.body;

    if (!Points || Points <= 0) {
      return res.status(400).json({ success: false, message: 'Valid number of points is required' });
    }

    const account = await LoyaltyAccount.findOne({ UserID: req.user.id });
    
    if (!account) {
      return res.status(404).json({ success: false, message: 'Loyalty account not found. Make a booking to earn points!' });
    }

    if (account.PointsBalance < Points) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient loyalty points. You have ${account.PointsBalance} points.`
      });
    }

    // Deduct loyalty points and add redemption points (1:1 ratio)
    account.PointsBalance -= Points;
    account.RedemptionPointsBalance += Points;
    account.History.push({
      type: 'purchase',
      Points: Points,
      Description: `Converted ${Points} loyalty points to redemption points`,
      Date: new Date()
    });
    account.LastUpdated = new Date();
    await account.save();

    return res.status(200).json({ 
      success: true, 
      data: account, 
      message: `Successfully converted ${Points} loyalty points to ${Points} redemption points!`
    });
  } catch (error) {
    console.error('Purchase redemption points error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
