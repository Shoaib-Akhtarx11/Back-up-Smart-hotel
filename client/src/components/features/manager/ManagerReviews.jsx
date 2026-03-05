import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaStar, FaReply, FaCheck, FaHotel } from 'react-icons/fa';
import { selectManagerDashboardData } from '../../../redux/managerSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5600/api';

const ManagerReviews = ({ hotels }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState('all');
  const [respondingTo, setRespondingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Get reviews from dashboard data
  const dashboardData = useSelector(selectManagerDashboardData);
  const dashboardReviews = dashboardData?.reviews || [];
  
  // Initialize reviews from dashboard data
  useEffect(() => {
    if (dashboardReviews.length > 0) {
      // Map dashboard reviews with hotel info
      const mappedReviews = dashboardReviews.map(review => {
        const hotel = hotels?.find(h => 
          (h._id || h.id) === (review.HotelID?._id || review.HotelID)
        );
        return {
          ...review,
          hotelName: hotel?.Name || review.HotelID?.Name || 'Hotel',
          hotelId: hotel?._id || hotel?.id || review.HotelID?._id || review.HotelID,
        };
      });
      setReviews(mappedReviews);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [dashboardReviews, hotels]);
  
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.Rating || r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  const filteredReviews = selectedHotel === 'all'
    ? reviews
    : reviews.filter(r => r.hotelId === selectedHotel);

  const handleSubmitReply = async (reviewId) => {
    if (!replyText.trim()) {
      alert('Please enter a response');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}/respond`, {
        method: 'PUT',
        ...getAuthHeader(),
        body: JSON.stringify({ managerReply: replyText }),
      });

      const data = await response.json();

      if (data.success) {
        setReviews(reviews.map(r => 
          r._id === reviewId 
            ? { ...r, managerReply: replyText, managerReplyDate: new Date() }
            : r
        ));
        setRespondingTo(null);
        setReplyText('');
        alert('Response submitted successfully!');
      } else {
        alert(data.message || 'Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
  <div>
    <div className="mb-4">
      <h4 className="fw-bold mb-1">Reviews & Ratings</h4>
      <p className="text-muted small mb-0">
        Monitor guest feedback and respond to reviews
      </p>
    </div>

    {reviews.length > 0 && (
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-warning fs-1 mb-2">
                {'★'.repeat(Math.round(avgRating))}
              </div>
              <h3 className="fw-bold mb-0">{avgRating}</h3>
              <p className="text-muted mb-0">Average Rating</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="fw-bold mb-0">{reviews.length}</h3>
              <p className="text-muted mb-0">Total Reviews</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="fw-bold mb-0">
                {reviews.filter(r => r.managerReply).length}
              </h3>
              <p className="text-muted mb-0">Responded</p>
            </div>
          </div>
        </div>
      </div>
    )}

    {hotels.length > 0 && (
      <div className="mb-4">
        <select
          className="form-select"
          value={selectedHotel}
          onChange={(e) => setSelectedHotel(e.target.value)}
        >
          <option value="all">All Hotels</option>
          {hotels.map(hotel => (
            <option key={hotel._id || hotel.id} value={hotel._id || hotel.id}>
              {hotel.Name}
            </option>
          ))}
        </select>
      </div>
    )}

    {loading ? (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    ) : hotels.length === 0 ? (
      <div className="text-center py-5">
        <div className="fs-1 mb-3">🏨</div>
        <h5 className="fw-bold">No Hotels</h5>
        <p className="text-muted">
          Add a hotel first to view and manage reviews.
        </p>
      </div>
    ) : filteredReviews.length === 0 ? (
      <div className="text-center py-5">
        <div className="fs-1 mb-3">⭐</div>
        <h5 className="fw-bold">No Reviews Yet</h5>
        <p className="text-muted">
          Once guests book and review your hotels, their feedback will appear
          here.
        </p>
      </div>
    ) : (
      <div className="row g-4">
        {filteredReviews.map((review) => (
          <div key={review._id || review.id} className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 className="fw-bold mb-1">
                      {review.UserID?.Name ||
                        review.guestName ||
                        'Guest User'}
                    </h6>
                    <p className="text-muted small mb-0">
                      <FaHotel className="me-1" />
                      {review.hotelName ||
                        review.HotelID?.Name ||
                        'Hotel'}
                    </p>
                  </div>
                  <div className="text-warning">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar
                        key={i}
                        style={{
                          color:
                            i < (review.Rating || review.rating)
                              ? '#FFC107'
                              : '#E0E0E0',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <p className="mb-3">{review.Comment || review.comment}</p>

                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {review.Timestamp
                      ? new Date(review.Timestamp).toLocaleDateString()
                      : review.timestamp
                      ? new Date(review.timestamp).toLocaleDateString()
                      : ''}
                  </small>

                  {review.managerReply ? (
                    <div className="bg-light p-2 rounded">
                      <small className="text-success fw-bold d-block">
                        <FaCheck className="me-1" /> Manager Response:
                      </small>
                      <small>{review.managerReply}</small>
                    </div>
                  ) : respondingTo === (review._id || review.id) ? (
                    <div className="w-50">
                      <textarea
                        className="form-control form-control-sm mb-2"
                        placeholder="Write your response..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={2}
                      />
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            handleSubmitReply(review._id || review.id)
                          }
                          disabled={submitting}
                        >
                          {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setRespondingTo(null);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        setRespondingTo(review._id || review.id)
                      }
                    >
                      <FaReply className="me-1" /> Respond
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
};

export default ManagerReviews;
