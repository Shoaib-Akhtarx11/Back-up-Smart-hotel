import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAllReviews, approveReview, deleteReview } from '../redux/reviewSlice';
import { selectAllHotels } from '../redux/hotelSlice';
import NavBar from '../components/layout/NavBar';
import Footer from '../components/layout/Footer';
import { FaStar, FaCheck, FaTimes, FaUser, FaCalendarAlt, FaBuilding } from 'react-icons/fa';
import './AdminReviewDashboard.css';

const AdminReviewDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const auth = useSelector((state) => state.auth || {});
  const currentUser = auth.user;
  const allHotels = useSelector(selectAllHotels);
  const allReviews = useSelector(selectAllReviews);
  
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchGuest, setSearchGuest] = useState('');
  
  // Redirect if not admin
  if (!auth.isAuthenticated || currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-5 mt-5">
        <h3>Access Denied</h3>
        <p className="text-muted">You must be an admin to access this page</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Back to Login
        </button>
      </div>
    );
  }
  
  // Filter reviews
  let filteredReviews = allReviews.filter(r => !r.isDeleted);
  
  if (filterRating !== 'all') {
    filteredReviews = filteredReviews.filter(r => r.rating === parseInt(filterRating));
  }
  
  if (filterStatus === 'pending') {
    filteredReviews = filteredReviews.filter(r => !r.isApproved);
  } else if (filterStatus === 'approved') {
    filteredReviews = filteredReviews.filter(r => r.isApproved);
  }
  
  if (searchGuest) {
    filteredReviews = filteredReviews.filter(r => 
      r.guestName.toLowerCase().includes(searchGuest.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchGuest.toLowerCase())
    );
  }
  
  const handleApproveReview = (reviewId) => {
    dispatch(approveReview(reviewId));
  };
  
  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      dispatch(deleteReview(reviewId));
    }
  };
  
  // Calculate stats
  const stats = {
    total: allReviews.length,
    approved: allReviews.filter(r => r.isApproved).length,
    pending: allReviews.filter(r => !r.isApproved).length,
    avgRating: (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length || 0).toFixed(1)
  };
  
  return (
    <div className="bg-light min-vh-100">
      <NavBar />
      
      <div className="container py-5">
        {/* Header */}
        <div className="mb-5">
          <h1 className="fw-bold mb-3">📊 Admin Review Dashboard</h1>
          <p className="text-muted mb-4">Monitor and manage all guest reviews across the platform</p>
          
          {/* Stats Cards */}
          <div className="row g-3 mb-4">
            <div className="col-lg-3">
              <div className="card border-0 shadow-sm rounded-3 p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Total Reviews</p>
                    <h3 className="fw-bold mb-0">{stats.total}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <FaStar size={24} className="text-primary" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3">
              <div className="card border-0 shadow-sm rounded-3 p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Approved</p>
                    <h3 className="fw-bold mb-0">{stats.approved}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                    <FaCheck size={24} className="text-success" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3">
              <div className="card border-0 shadow-sm rounded-3 p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Pending</p>
                    <h3 className="fw-bold mb-0">{stats.pending}</h3>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                    <FaTimes size={24} className="text-warning" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3">
              <div className="card border-0 shadow-sm rounded-3 p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Avg Rating</p>
                    <div className="d-flex align-items-center gap-2">
                      <h3 className="fw-bold mb-0">{stats.avgRating}</h3>
                      <FaStar className="text-warning" />
                    </div>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                    <FaStar size={24} className="text-info" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="card border-0 shadow-sm rounded-3 mb-4 p-4">
          <h5 className="fw-bold mb-3">Filters</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <input 
                type="text" 
                className="form-control rounded-2" 
                placeholder="Search guest name or comment..."
                value={searchGuest}
                onChange={(e) => setSearchGuest(e.target.value)}
              />
            </div>
            
            <div className="col-md-3">
              <select 
                className="form-select rounded-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved Only</option>
                <option value="pending">Pending Only</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <select 
                className="form-select rounded-2"
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                <option value="3">⭐⭐⭐ (3 Stars)</option>
                <option value="2">⭐⭐ (2 Stars)</option>
                <option value="1">⭐ (1 Star)</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <button className="btn btn-outline-secondary w-100 rounded-2" onClick={() => {
                setFilterRating('all');
                setFilterStatus('all');
                setSearchGuest('');
              }}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Reviews List */}
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="card-body p-0">
            {filteredReviews.length > 0 ? (
              <div>
                {filteredReviews.map((review) => {
                  const hotel = allHotels.find(h => h.id === review.hotelId);
                  return (
                    <div key={review.id} className="p-4 border-bottom review-item">
                      {/* Review Header */}
                      <div className="row mb-3">
                        <div className="col-lg-8">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <FaUser size={16} className="text-primary" />
                            <strong>{review.guestName}</strong>
                            {review.isApproved ? (
                              <span className="badge bg-success">Approved</span>
                            ) : (
                              <span className="badge bg-warning text-dark">Pending</span>
                            )}
                          </div>
                          
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <FaBuilding size={16} className="text-info" />
                            <span className="fw-bold">{hotel?.name}</span>
                            <span className="text-muted">({hotel?.location})</span>
                          </div>
                          
                          <div className="d-flex align-items-center gap-3">
                            <div className="d-flex gap-1">
                              {Array(5).fill(0).map((_, i) => (
                                <FaStar
                                  key={i}
                                  size={14}
                                  className={i < review.rating ? 'text-warning' : 'text-light'}
                                />
                              ))}
                            </div>
                            
                            <div className="d-flex align-items-center gap-1 text-muted">
                              <FaCalendarAlt size={14} />
                              <small>
                                {new Date(review.reviewDate).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </small>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-lg-4 text-end">
                          {!review.isApproved && (
                            <button
                              className="btn btn-sm btn-success rounded-2 me-2"
                              onClick={() => handleApproveReview(review.id)}
                            >
                              <FaCheck className="me-1" /> Approve
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-danger rounded-2"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            <FaTimes className="me-1" /> Delete
                          </button>
                        </div>
                      </div>
                      
                      {/* Review Comment */}
                      <div className="mb-3 p-3 bg-light rounded-2">
                        <p className="mb-0">{review.comment}</p>
                      </div>
                      
                      {/* Manager Reply */}
                      {review.managerReply && (
                        <div className="p-3 bg-success bg-opacity-10 border-start border-success border-3 rounded-2">
                          <p className="fw-bold small mb-2">Manager Response:</p>
                          <p className="mb-1">{review.managerReply}</p>
                          <small className="text-muted">
                            Replied on {new Date(review.repliedAt).toLocaleDateString('en-IN')}
                          </small>
                        </div>
                      )}
                      
                      {/* Additional Responses */}
                      {review.responses && review.responses.length > 0 && (
                        <div className="mt-3">
                          <p className="fw-bold small mb-2">Additional Feedback:</p>
                          {review.responses.map((response) => (
                            <div key={response.id} className="p-2 bg-info bg-opacity-10 rounded-2 mb-2 border-start border-info border-3">
                              <small className="text-muted">{response.managerName} - {new Date(response.respondedAt).toLocaleDateString('en-IN')}</small>
                              <p className="mb-0 small">{response.response}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">No reviews found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminReviewDashboard;
