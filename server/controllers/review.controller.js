import Review from '../models/review.model.js';
import Hotel from '../models/hotel.model.js';

// @desc    Submit a review and update hotel rating
// @route   POST /api/reviews
// @access  Private (guest)
export const createReview = async (req, res) => {
  try {
    const { HotelID, Rating, Comment } = req.body;

    if (!HotelID || Rating === undefined) {
      return res.status(400).json({ success: false, message: 'HotelID and Rating are required' });
    }
    if (Rating < 1 || Rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const hotel = await Hotel.findById(HotelID);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const review = await Review.create({
      UserID: req.user.id,
      HotelID,
      Rating,
      Comment: Comment || '',
      Timestamp: new Date(),
    });

    // Recalculate hotel rating
    const allReviews = await Review.find({ HotelID });
    const avgRating = (allReviews.reduce((sum, r) => sum + r.Rating, 0) / allReviews.length).toFixed(1);
    hotel.Rating = parseFloat(avgRating);
    await hotel.save();

    return res.status(201).json({ 
      success: true, 
      data: review,
      hotelNewRating: hotel.Rating,
      message: `Review submitted! Hotel rating updated to ${hotel.Rating}` 
    });
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get reviews for a hotel or all reviews
// @route   GET /api/reviews?HotelID=id
// @access  Public
export const getReviews = async (req, res) => {
  try {
    const { HotelID } = req.query;
    let filter = {};
    if (HotelID) {
      filter.HotelID = HotelID;
    }
    const reviews = await Review.find(filter)
      .populate('UserID', 'Name Email')
      .sort({ Timestamp: -1 });
      
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
export const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('UserID', 'Name Email')
      .populate('HotelID', 'Name Location');
      
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error('Get review error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update review and recalculate hotel rating
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.UserID.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { Rating, Comment } = req.body;
    if (Rating !== undefined && (Rating < 1 || Rating > 5)) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    if (Rating !== undefined) review.Rating = Rating;
    if (Comment) review.Comment = Comment;
    
    await review.save();

    // Recalculate hotel rating
    const allReviews = await Review.find({ HotelID: review.HotelID });
    const avgRating = (allReviews.reduce((sum, r) => sum + r.Rating, 0) / allReviews.length).toFixed(1);
    const hotel = await Hotel.findById(review.HotelID);
    hotel.Rating = parseFloat(avgRating);
    await hotel.save();

    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error('Update review error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete review and recalculate hotel rating
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.UserID.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const hotelID = review.HotelID;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate hotel rating
    const allReviews = await Review.find({ HotelID: hotelID });
    const hotel = await Hotel.findById(hotelID);
    if (allReviews.length > 0) {
      const avgRating = (allReviews.reduce((sum, r) => sum + r.Rating, 0) / allReviews.length).toFixed(1);
      hotel.Rating = parseFloat(avgRating);
    } else {
      hotel.Rating = 0;
    }
    await hotel.save();

    return res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Manager respond to review
// @route   PUT /api/reviews/:id/respond
// @access  Private (manager)
export const respondToReview = async (req, res) => {
  try {
    const { managerReply } = req.body;

    if (!managerReply) {
      return res.status(400).json({ success: false, message: 'Manager reply is required' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user is a manager
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only managers can respond to reviews' });
    }

    // Add manager reply
    review.managerReply = managerReply;
    review.managerReplyDate = new Date();
    review.managerId = req.user.id;
    await review.save();

    return res.status(200).json({ 
      success: true, 
      data: review,
      message: 'Response added successfully'
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get reviews for manager's hotel
// @route   GET /api/reviews/manager/:hotelId
// @access  Private (manager)
export const getManagerHotelReviews = async (req, res) => {
  try {
    const { hotelId } = req.params;

    // Verify the manager owns this hotel
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Check if the requesting manager owns this hotel
    if (req.user.role === 'manager' && hotel.ManagerID?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view reviews for this hotel' });
    }

    const reviews = await Review.find({ HotelID: hotelId })
      .populate('UserID', 'Name Email')
      .sort({ Timestamp: -1 });

    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get manager hotel reviews error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
