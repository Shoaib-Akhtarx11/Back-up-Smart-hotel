import Review from '../models/review.model.js';
import Hotel from '../models/hotel.model.js';

// @desc    Create review (guest)
// @route   POST /api/reviews
// @access  Private (guest)
export const createReview = async (req, res) => {
  try {
    const { hotelId, rating, comment } = req.body;
    if (!hotelId || rating === undefined) {
      return res.status(400).json({ success: false, message: 'hotelId and rating are required' });
    }
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    const review = await Review.create({
      user: req.user.id,
      hotel: hotelId,
      rating,
      comment,
    });
    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get reviews (optional hotel filter)
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req, res) => {
  try {
    const { hotelId } = req.query;
    const filter = hotelId ? { hotel: hotelId } : {};
    const reviews = await Review.find(filter).populate('user', 'name email');
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update review (owner or admin)
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }
    const { rating, comment } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();
    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error('Update review error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete review (owner or admin)
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }
    await review.remove();
    return res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};