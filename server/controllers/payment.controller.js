import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';
import LoyaltyAccount from '../models/loyalty.model.js';

// @desc    Create payment (simplified - no real gateway)
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res) => {
  try {
    const { BookingID, Amount, PaymentMethod } = req.body;

    if (!BookingID || !Amount || !PaymentMethod) {
      return res.status(400).json({ success: false, message: 'BookingID, Amount, and PaymentMethod are required' });
    }

    const booking = await Booking.findById(BookingID);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.UserID.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Create payment record
    const payment = await Payment.create({
      UserID: req.user.id,
      BookingID,
      Amount,
      Status: 'paid',
      PaymentMethod,
      CreatedAt: new Date(),
    });

    // Update booking status to confirmed
    booking.Status = 'confirmed';
    booking.PaymentID = payment._id;
    await booking.save();

    // Add loyalty points (1 point per 100 rupees)
    const pointsEarned = Math.floor(Amount / 100);
    let loyalty = await LoyaltyAccount.findOne({ UserID: req.user.id });
    if (!loyalty) {
      loyalty = await LoyaltyAccount.create({
        UserID: req.user.id,
        PointsBalance: pointsEarned,
        LastUpdated: new Date(),
      });
    } else {
      loyalty.PointsBalance += pointsEarned;
      loyalty.LastUpdated = new Date();
      await loyalty.save();
    }

    return res.status(201).json({
      success: true,
      data: payment,
      pointsEarned,
      message: `Payment successful! Booking confirmed. You earned ${pointsEarned} loyalty points`,
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get payments
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') {
      filter.UserID = req.user.id;
    }
    const payments = await Payment.find(filter)
      .populate('BookingID', 'CheckInDate CheckOutDate Status')
      .populate('UserID', 'Name Email');

    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error('Get payments error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
export const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('BookingID')
      .populate('UserID', 'Name Email ContactNumber');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (req.user.role !== 'admin' && payment.UserID._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error('Get payment error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Refund payment
// @route   PUT /api/payments/:id
// @access  Private
export const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (req.user.role !== 'admin' && payment.UserID.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update payment status
    payment.Status = 'refunded';
    await payment.save();

    // Update booking status
    const booking = await Booking.findById(payment.BookingID);
    if (booking) {
      booking.Status = 'cancelled';
      await booking.save();
    }

    return res.status(200).json({ success: true, data: payment, message: 'Payment refunded successfully' });
  } catch (error) {
    console.error('Refund payment error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};