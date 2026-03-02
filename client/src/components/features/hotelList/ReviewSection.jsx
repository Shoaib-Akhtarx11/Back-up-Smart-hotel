import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectHotelReviews, addReview } from '../../../redux/reviewSlice';
import { FaStar } from 'react-icons/fa';
import './ReviewSection.css';

const ReviewSection = ({ hotelId, hotelName }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth || {});
  const currentUser = auth.user;
  const isAuthenticated = auth.isAuthenticated;

  // Get reviews for the hotel
  const hotelReviews = useSelector(selectHotelReviews(hotelId));
  
  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [expandedReviewId, setExpandedReviewId] = useState(null);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { message: 'Please login to write a review' } 
      });
      return;
    }

    if (rating === 0) {
      setSubmitMessage('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setSubmitMessage('Review must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      const newReview = {
        userId: currentUser?.id,
        guestName: currentUser?.name || 'Guest',
        hotelId: hotelId,
        hotelName: hotelName,
        rating: rating,
        comment: comment.trim(),
        reviewDate: new Date().toISOString(),
        managerReply: null,
        repliedAt: null,
        managerId: null,
        responses: []
      };

      dispatch(addReview(newReview));

      setRating(0);
      setComment('');
      setSubmitMessage('✓ Review posted successfully!');

      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmitMessage('Error submitting review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate average rating
  const averageRating = hotelReviews.length > 0 
    ? (hotelReviews.reduce((sum, review) => sum + review.rating, 0) / hotelReviews.length).toFixed(1)
    : 'N/A';

  return (
    <div className="review-section-container">
      <h3 className="fw-bold mb-4">⭐ Guest Reviews & Feedback</h3>
      
      <div className="row g-4">
        {/* Left: Review Form */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-success bg-opacity-10 border-0 p-4">
              <h5 className="mb-0 fw-bold">Share Your Experience</h5>
              <p className="text-muted small mt-1 mb-0">Help other guests with your feedback</p>
            </div>

            <form onSubmit={handleSubmitReview} className="card-body p-4">
              {/* Rating Selection */}
              <div className="mb-4">
                <label className="form-label fw-bold mb-3">Rate Your Stay</label>
                <div className="d-flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`btn p-0 ${star <= (hoverRating || rating) ? 'text-warning' : 'text-muted'}`}
                      style={{ fontSize: '32px', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <small className="text-success fw-bold d-block mt-2">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </small>
                )}
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label htmlFor="reviewComment" className="form-label fw-bold">
                  Your Review
                </label>
                <textarea
                  id="reviewComment"
                  className="form-control rounded-3"
                  placeholder="Share your experience... (minimum 10 characters)"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                  disabled={isSubmitting}
                />
                <small className="text-muted d-block mt-2">
                  {comment.length}/500 characters
                </small>
              </div>

              {/* Message */}
              {submitMessage && (
                <div className={`alert mb-3 border-0 ${submitMessage.includes('✓') ? 'alert-success' : 'alert-warning'}`}>
                  {submitMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-success w-100 fw-bold rounded-pill py-2"
                disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Posting...
                  </>
                ) : (
                  '✓ Post Review'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Reviews Display */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-light border-0 p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-2 fw-bold">Guest Reviews</h5>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-warning">
                      {'★'.repeat(Math.round(parseFloat(averageRating) || 0))}
                    </span>
                    <span className="fw-bold">{averageRating}/5</span>
                    <span className="text-muted small">({hotelReviews.length} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body p-4">
              {hotelReviews.length > 0 ? (
                <div className="reviews-list">
                  {hotelReviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="mb-4 pb-4 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="fw-bold mb-0 text-dark">{review.guestName}</h6>
                          <small className="text-muted">{new Date(review.reviewDate).toLocaleDateString()}</small>
                        </div>
                        <span className="text-warning">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                      
                      <p className="text-dark mb-2 small">
                        {review.comment.length > 120 && expandedReviewId !== review.id
                          ? `${review.comment.substring(0, 120)}...`
                          : review.comment
                        }
                      </p>
                      
                      {review.comment.length > 120 && (
                        <button
                          className="btn btn-link btn-sm p-0 text-success"
                          onClick={() => setExpandedReviewId(expandedReviewId === review.id ? null : review.id)}
                        >
                          {expandedReviewId === review.id ? 'Read Less' : 'Read More'}
                        </button>
                      )}

                      {review.managerReply && (
                        <div className="alert alert-light mt-3 mb-0 border-start border-3 border-primary p-3">
                          <div className="d-flex gap-2">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '12px', flexShrink: 0 }}>
                              M
                            </div>
                            <div className="flex-grow-1">
                              <small className="fw-bold d-block text-primary">Manager's Reply</small>
                              <p className="mb-0 small text-dark">{review.managerReply}</p>
                              <small className="text-muted">{new Date(review.repliedAt).toLocaleDateString()}</small>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {hotelReviews.length > 5 && (
                    <div className="text-center pt-3">
                      <button className="btn btn-outline-success btn-sm rounded-pill">
                        View All {hotelReviews.length} Reviews
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-chat-dots display-4 text-muted mb-3 d-block opacity-50"></i>
                  <h6 className="text-muted mb-2">No reviews yet</h6>
                  <p className="text-muted small">Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
