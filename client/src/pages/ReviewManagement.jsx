import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectHotelReviews } from "../redux/reviewSlice";
import { selectAllHotels } from "../redux/hotelSlice";
import NavBar from "../components/layout/NavBar";
import Footer from "../components/layout/Footer";
import {
  FaStar,
  FaReply,
  FaCalendarAlt,
  FaUser,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
const ReviewManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchHotel, setSearchHotel] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingReply, setEditingReply] = useState(null);
  //    Get current manager
  const auth = useSelector((state) => state.auth);
  const currentManager = auth.user;
  const managerId = currentManager?.id;
  // Get all hotels
  const allHotels = useSelector(selectAllHotels);
  // // Filter manager's hotels
  const managerHotels = allHotels.filter(
    (hotel) => hotel.managerId === managerId,
  );
  //  // ✅ FIX: Get all reviews for manager's hotels with a single useSelector
  const allReviews = useSelector((state) =>
    managerHotels.flatMap((hotel) => selectHotelReviews(hotel.id)(state)),
  );
  // // Apply search and filter
  const filterReviews = (reviews) => {
    let filtered = reviews;
    if (searchHotel) {
      filtered = filtered.filter((review) => {
        const hotel = allHotels.find((h) => h.id === review.hotelId);
        return hotel?.name.toLowerCase().includes(searchHotel.toLowerCase());
      });
    }
    if (filterRating !== "all") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(filterRating),
      );
    }
    return filtered.sort(
      (a, b) => new Date(b.reviewDate) - new Date(a.reviewDate),
    );
  };
  const filteredReviews = filterReviews(allReviews);
  const handleReply = (review) => {
    if (!replyText.trim()) {
      alert("Please write a reply");
      return;
    }
    // TODO: Implement manager response feature via backend API
    // dispatch(updateReview({
    //   reviewId: review.id,
    //   updates: { managerReply: replyText.trim() }
    // }));
    setReplyingTo(null);
    setEditingReply(null);
    setReplyText("");
  };
  const startEditReply = (review) => {
    setEditingReply(review.id);
    setReplyText(review.managerReply || "");
    setReplyingTo(review.id);
  };
  // Calculate average rating for each hotel (memoized)
  const hotelStats = useMemo(() => {
    const stats = {};
    managerHotels.forEach((hotel) => {
      const hotelReviews = allReviews.filter((r) => r.hotelId === hotel.id);
      if (hotelReviews.length === 0) {
        stats[hotel.id] = { avgRating: 0, count: 0 };
      } else {
        const avgRating = (
          hotelReviews.reduce((sum, r) => sum + r.rating, 0) /
          hotelReviews.length
        ).toFixed(1);
        stats[hotel.id] = { avgRating, count: hotelReviews.length };
      }
    });
    return stats;
  }, [allReviews, managerHotels]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar />

      <div
        className="flex-grow-1"
        style={{
          backgroundColor: "#f8f9fa",
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <div className="container" style={{ maxWidth: "1200px" }}>
          {/* Header */}
          <div className="mb-5">
            <button
              onClick={() => navigate("/manager")}
              className="btn btn-outline-secondary rounded-pill mb-3"
            >
              ← Back to Dashboard
            </button>
            <h2 className="fw-bold">⭐ Manage & Respond to Reviews</h2>
            <p className="text-muted">
              View guest reviews and respond to feedback for your hotels
            </p>
          </div>

          {/* Summary Cards */}
          <div className="row mb-4 g-3">
            {managerHotels.map((hotel) => {
              const stats = hotelStats[hotel.id] || { avgRating: 0, count: 0 };
              return (
                <div key={hotel.id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 p-4">
                    <h6 className="fw-bold mb-3">{hotel.name}</h6>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <p className="text-muted small mb-1">Rating</p>
                        <div className="d-flex align-items-center gap-1">
                          {stats.avgRating > 0 ? (
                            <>
                              <span className="fs-5 fw-bold">
                                {stats.avgRating}
                              </span>
                              <span className="text-warning">★</span>
                            </>
                          ) : (
                            <span className="text-muted">No ratings yet</span>
                          )}
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="text-muted small mb-1">Total Reviews</p>
                        <p className="fs-5 fw-bold mb-0">{stats.count}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="row mb-4 g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="Search by hotel name..."
                value={searchHotel}
                onChange={(e) => setSearchHotel(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <select
                className="form-select rounded-3"
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
          </div>

          {/* Reviews Grid */}
          <div className="row g-4">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => {
                const hotel = allHotels.find((h) => h.id === review.hotelId);
                const hasReply = !!review.managerReply;

                return (
                  <div key={review.id} className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 d-flex flex-column">
                      {/* Card Header */}
                      <div className="card-header bg-light border-0 p-4">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-2 text-dark">
                              {hotel?.name}
                            </h6>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <FaUser size={12} className="text-primary" />
                              <span className="small text-dark">
                                {review.guestName}
                              </span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <FaStar
                                  key={i}
                                  size={14}
                                  color={
                                    i < review.rating ? "#FFC107" : "#E0E0E0"
                                  }
                                />
                              ))}
                              <small className="text-muted ms-2">
                                <FaCalendarAlt size={12} className="me-1" />
                                {new Date(
                                  review.reviewDate,
                                ).toLocaleDateString()}
                              </small>
                            </div>
                          </div>
                          <span
                            className={`badge rounded-pill ${hasReply ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}
                          >
                            {hasReply ? "✓ Replied" : "No Reply Yet"}
                          </span>
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="card-body p-4 flex-grow-1">
                        <div className="mb-4">
                          <p className="text-dark small mb-0">
                            {review.comment}
                          </p>
                        </div>

                        {/* Manager Reply Display */}
                        {review.managerReply && replyingTo !== review.id ? (
                          <div className="bg-primary-subtle rounded-3 p-3 mb-3">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <FaReply size={14} className="text-primary" />
                              <span className="fw-bold small text-primary">
                                Your Response
                              </span>
                            </div>
                            <p className="text-dark small mb-2">
                              {review.managerReply}
                            </p>
                            <small className="text-muted d-block">
                              Replied on{" "}
                              {new Date(review.repliedAt).toLocaleDateString()}
                            </small>
                          </div>
                        ) : null}

                        {/* Reply Form */}
                        {replyingTo === review.id ? (
                          <div className="bg-light rounded-3 p-3">
                            <label className="small fw-bold mb-2 d-block">
                              Write Your Response
                            </label>
                            <textarea
                              className="form-control rounded-2 mb-3"
                              rows="4"
                              placeholder="Share your response to this review..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              maxLength={500}
                            />
                            <small className="text-muted d-block mb-3">
                              {replyText.length}/500 characters
                            </small>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-primary rounded-pill fw-bold flex-grow-1"
                                onClick={() => handleReply(review)}
                                disabled={!replyText.trim()}
                              >
                                <FaReply className="me-1" />
                                Post Response
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary rounded-pill"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setEditingReply(null);
                                  setReplyText("");
                                }}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex gap-2">
                            {review.managerReply ? (
                              <button
                                className="btn btn-sm btn-outline-primary rounded-pill fw-bold flex-grow-1"
                                onClick={() => startEditReply(review)}
                              >
                                <FaEdit className="me-1" />
                                Edit Response
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-primary rounded-pill fw-bold flex-grow-1"
                                onClick={() => setReplyingTo(review.id)}
                              >
                                <FaReply className="me-1" />
                                Respond
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12">
                <div className="text-center py-5 bg-white rounded-4 border">
                  <i className="bi bi-chat-left display-4 text-muted mb-3 d-block opacity-50"></i>
                  <h5 className="text-muted">No reviews found</h5>
                  <p className="text-muted small">
                    When guests leave reviews, they will appear here for you to
                    respond to.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReviewManagement;
