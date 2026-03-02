import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';

// @desc    Create a payment for a booking (guest)
// @route   POST /api/payments
// @access  Private (guest)
export const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, method } = req.body;
    if (!bookingId || amount === undefined || !method) {
      return res.status(400).json({ success: false, message: 'bookingId, amount and method are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
    }

    const payment = await Payment.create({
      user: req.user.id,
      booking: bookingId,
      amount,
      method,
      status: 'paid', // assuming immediate success for now
    });

    booking.payment = payment._id;
    booking.status = 'confirmed';
    await booking.save();

    return res.status(201).json({ success: true, data: payment });
  } catch (error) {
    console.error('Create payment error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get payments (user or admin)
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    }
    const payments = await Payment.find(filter).populate('booking');
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
    const payment = await Payment.findById(req.params.id).populate('booking');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (req.user.role !== 'admin' && payment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this payment' });
    }
    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error('Get payment error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update payment status (admin)
// @route   PUT /api/payments/:id
// @access  Private (admin)
export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    const { status } = req.body;
    if (status) payment.status = status;
    await payment.save();
    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error('Update payment error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete payment (admin)
// @route   DELETE /api/payments/:id
// @access  Private (admin)
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    await payment.remove();
    return res.status(200).json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    console.error('Delete payment error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};