import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FaCalendar, 
  FaHotel, 
  FaDoorOpen, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaHourglass,
  FaMoneyBillWave,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaStar,
  FaUndo,
  FaSpinner,
  FaInfoCircle,
  FaExclamationTriangle
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5600';

const UserBookings = ({ bookings: propBookings, loading: propLoading, onBookingCancelled }) => {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  const [bookings, setBookings] = useState(propBookings || []);
  const [loading, setLoading] = useState(propLoading || false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  // Load bookings from backend if not provided
  useEffect(() => {
    if (propBookings) {
      setBookings(propBookings);
    } else {
      loadBookings();
    }
  }, [propBookings]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Transform bookings to a consistent format
        const transformedBookings = data.data.map(booking => ({
          _id: booking._id,
          id: booking.BookingID || booking._id,
          hotelName: booking.RoomID?.HotelID?.Name || 'N/A',
          hotel: booking.RoomID?.HotelID?.Name || 'N/A',
          roomType: booking.RoomID?.Type || 'N/A',
          room: booking.RoomID?.Type || 'N/A',
          checkInDate: booking.CheckInDate,
          checkOutDate: booking.CheckOutDate,
          status: booking.Status,
          numberOfRooms: booking.NumberOfRooms,
          price: booking.RoomID?.Price || 0,
          createdAt: booking.createdAt
        }));
        setBookings(transformedBookings);
      } else {
        console.error("Failed to load bookings:", data.message);
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
    setLoading(false);
  };

  const getBookingStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "confirmed" || statusLower === "success") {
      return (
        <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-2 rounded-pill">
          <FaCheckCircle className="me-1" />
          Confirmed
        </span>
      );
    } else if (statusLower === "cancelled") {
      return (
        <span className="badge bg-danger bg-opacity-10 text-danger fw-bold px-3 py-2 rounded-pill">
          <FaTimesCircle className="me-1" />
          Cancelled
        </span>
      );
    } else {
      return (
        <span className="badge bg-warning bg-opacity-10 text-warning fw-bold px-3 py-2 rounded-pill">
          <FaHourglass className="me-1" />
          Pending
        </span>
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const canCancelBooking = (booking) => {
    if (!booking || booking.status?.toLowerCase() === 'cancelled') return false;
    const checkInDate = new Date(booking.checkInDate);
    const currentDate = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return checkInDate.getTime() - currentDate.getTime() >= oneDayInMs;
  };

  const handleViewDetails = async (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
    setDetailsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/bookings/${booking._id}/details`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setBookingDetails(data.data);
      } else {
        console.error("Failed to load booking details:", data.message);
        // Use basic booking data if details fetch fails
        setBookingDetails({
          _id: booking._id,
          bookingID: booking.id,
          status: booking.status,
          numberOfRooms: booking.numberOfRooms,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          hotel: { name: booking.hotelName },
          room: { type: booking.roomType, price: booking.price },
          canCancel: canCancelBooking(booking)
        });
      }
    } catch (error) {
      console.error("Error loading booking details:", error);
      setBookingDetails({
        _id: booking._id,
        bookingID: booking.id,
        status: booking.status,
        numberOfRooms: booking.numberOfRooms,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        hotel: { name: booking.hotelName },
        room: { type: booking.roomType, price: booking.price },
        canCancel: canCancelBooking(booking)
      });
    }
    setDetailsLoading(false);
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    
    setCancelLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings/${selectedBooking._id}/cancel`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Update bookings list
        const updatedBookings = bookings.map(b => 
          b._id === selectedBooking._id 
            ? { ...b, status: 'cancelled' }
            : b
        );
        setBookings(updatedBookings);
        
        // Close modal
        setShowCancelModal(false);
        setSelectedBooking(null);
        
        // If there's a callback, call it
        if (onBookingCancelled) {
          onBookingCancelled(selectedBooking._id);
        }
        
        alert('Booking cancelled successfully!');
        
        // Refresh details if modal is open
        if (showDetailsModal && bookingDetails) {
          setBookingDetails({ ...bookingDetails, status: 'cancelled', canCancel: false });
        }
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert('Error cancelling booking. Please try again.');
    }
    setCancelLoading(false);
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const now = new Date();
    const checkIn = new Date(booking.checkInDate);
    
    if (filter === 'upcoming') {
      return checkIn >= now && booking.status?.toLowerCase() !== 'cancelled';
    } else if (filter === 'past') {
      return checkIn < now;
    } else if (filter === 'cancelled') {
      return booking.status?.toLowerCase() === 'cancelled';
    }
    return true;
  });

  return (
    <>
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                <FaCalendar className="text-primary fs-4" />
              </div>
              <div>
                <h4 className="fw-bold mb-0">My Bookings</h4>
                <p className="text-muted small mb-0">View and manage your reservations</p>
              </div>
            </div>
            <span className="badge bg-primary rounded-pill px-3 py-2">
              {filteredBookings.length} Bookings
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="mb-4">
            <div className="btn-group w-100" role="group">
              <button 
                type="button" 
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                type="button" 
                className={`btn ${filter === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </button>
              <button 
                type="button" 
                className={`btn ${filter === 'past' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('past')}
              >
                Past
              </button>
              <button 
                type="button" 
                className={`btn ${filter === 'cancelled' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('cancelled')}
              >
                Cancelled
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-3">Loading your bookings...</p>
            </div>
          ) : filteredBookings && filteredBookings.length > 0 ? (
            <div className="row g-3">
              {filteredBookings.map((booking, index) => (
                <div key={index} className="col-12">
                  <div className="card border bg-white rounded-4 p-4 hover-card" style={{ transition: "all 0.3s ease" }}>
                    <div className="row align-items-center">
                      <div className="col-md-2 col-12 mb-3 mb-md-0">
                        <div className="bg-primary bg-opacity-10 rounded-3 p-3 text-center">
                          <FaHotel className="text-primary fs-3" />
                        </div>
                      </div>
                      <div className="col-md-6 col-12 mb-3 mb-md-0">
                        <h5 className="fw-bold mb-2">{booking.hotelName || booking.hotel || "Hotel Booking"}</h5>
                        <div className="d-flex flex-wrap gap-3 text-muted small">
                          <span className="d-flex align-items-center">
                            <FaDoorOpen className="me-1" />
                            {booking.roomType || booking.room || "Standard Room"}
                          </span>
                          <span className="d-flex align-items-center">
                            <FaClock className="me-1" />
                            ID: {booking.id ? booking.id.toString().slice(-6) : `BK${index + 1}`}
                          </span>
                        </div>
                        <div className="mt-2 d-flex gap-3 text-muted">
                          <span>
                            <strong>Check-in:</strong> {formatDate(booking.checkInDate)}
                          </span>
                          <span>
                            <strong>Check-out:</strong> {formatDate(booking.checkOutDate)}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4 col-12 text-md-end">
                        {getBookingStatusBadge(booking.status)}
                        <div className="mt-3 d-flex gap-2 justify-content-md-end flex-wrap">
                          <button 
                            className="btn btn-outline-primary btn-sm rounded-pill"
                            onClick={() => handleViewDetails(booking)}
                          >
                            <FaInfoCircle className="me-1" />
                            View Details
                          </button>
                          {canCancelBooking(booking) && (
                            <button 
                              className="btn btn-outline-danger btn-sm rounded-pill"
                              onClick={() => handleCancelClick(booking)}
                            >
                              <FaTimesCircle className="me-1" />
                              Cancel
                            </button>
                          )}
                          {!canCancelBooking(booking) && booking.status?.toLowerCase() !== 'cancelled' && (
                            <span className="badge bg-secondary bg-opacity-10 text-secondary small d-flex align-items-center">
                              <FaExclamationTriangle className="me-1" />
                              Cannot cancel
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 bg-light rounded-4 border">
              <div className="fs-1 mb-3">📅</div>
              <h5 className="fw-bold">No Bookings Found</h5>
              <p className="text-muted mb-3">
                {filter === 'all' 
                  ? "You haven't made any reservations yet." 
                  : `You don't have any ${filter} bookings.`}
              </p>
              {filter === 'all' && (
                <Link to="/hotelList" className="btn btn-primary rounded-pill px-4">
                  Browse Hotels
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <FaHotel className="me-2" />
                  Booking Details
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
              </div>
              <div className="modal-body">
                {detailsLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : bookingDetails ? (
                  <div className="row g-3">
                    {/* Booking Status */}
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Booking ID:</span>
                        <span className="fw-bold">{bookingDetails.bookingID?.toString().slice(-6) || 'N/A'}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="text-muted">Status:</span>
                        {getBookingStatusBadge(bookingDetails.status)}
                      </div>
                    </div>

                    {/* Hotel Info */}
                    <div className="col-12 border-top pt-3">
                      <h6 className="fw-bold mb-3">Hotel Information</h6>
                      <div className="row g-2">
                        <div className="col-12">
                          <div className="d-flex align-items-center">
                            <FaHotel className="text-primary me-2" />
                            <span className="fw-bold">{bookingDetails.hotel?.name || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="d-flex align-items-center">
                            <FaMapMarkerAlt className="text-muted me-2" />
                            <span className="text-muted">
                              {bookingDetails.hotel?.location || 'N/A'}
                              {bookingDetails.hotel?.address && `, ${bookingDetails.hotel.address}`}
                            </span>
                          </div>
                        </div>
                        {bookingDetails.hotel?.rating && (
                          <div className="col-12">
                            <div className="d-flex align-items-center">
                              <FaStar className="text-warning me-2" />
                              <span>{bookingDetails.hotel.rating} / 5</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Room Info */}
                    <div className="col-12 border-top pt-3">
                      <h6 className="fw-bold mb-3">Room Information</h6>
                      <div className="row g-2">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <FaDoorOpen className="text-primary me-2" />
                            <span>Room Type: <strong>{bookingDetails.room?.type || 'N/A'}</strong></span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <span>Number of Rooms: <strong>{bookingDetails.numberOfRooms}</strong></span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <span>Price per Night: <strong>${bookingDetails.room?.price || 0}</strong></span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <span>Total Nights: <strong>{bookingDetails.totalNights || 0}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Dates */}
                    <div className="col-12 border-top pt-3">
                      <h6 className="fw-bold mb-3">Booking Dates</h6>
                      <div className="row g-2">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <FaCalendar className="text-success me-2" />
                            <span>Check-in: <strong>{formatDate(bookingDetails.checkInDate)}</strong></span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <FaCalendar className="text-danger me-2" />
                            <span>Check-out: <strong>{formatDate(bookingDetails.checkOutDate)}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Guest Info */}
                    <div className="col-12 border-top pt-3">
                      <h6 className="fw-bold mb-3">Guest Information</h6>
                      <div className="row g-2">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <FaUser className="text-primary me-2" />
                            <span>Name: <strong>{bookingDetails.user?.name || 'N/A'}</strong></span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <FaPhone className="text-muted me-2" />
                            <span>Phone: <strong>{bookingDetails.user?.phone || 'N/A'}</strong></span>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="d-flex align-items-center">
                            <FaEnvelope className="text-muted me-2" />
                            <span>Email: <strong>{bookingDetails.user?.email || 'N/A'}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    {bookingDetails.payment && (
                      <div className="col-12 border-top pt-3">
                        <h6 className="fw-bold mb-3">Payment Information</h6>
                        <div className="row g-2">
                          <div className="col-md-6">
                            <div className="d-flex align-items-center">
                              <FaMoneyBillWave className="text-success me-2" />
                              <span>Method: <strong>{bookingDetails.payment.method || 'N/A'}</strong></span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex align-items-center">
                              <span>Amount: <strong>${bookingDetails.payment.amount || bookingDetails.totalPrice || 0}</strong></span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex align-items-center">
                              <span>Status: </span>
                              <span className={`badge ms-2 ${bookingDetails.payment.status === 'success' ? 'bg-success' : 'bg-warning'}`}>
                                {bookingDetails.payment.status || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Total Price */}
                    <div className="col-12 border-top pt-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="h5 mb-0">Total Price:</span>
                        <span className="h4 mb-0 text-primary fw-bold">
                          ${bookingDetails.totalPrice || (bookingDetails.room?.price * bookingDetails.totalNights * bookingDetails.numberOfRooms) || 0}
                        </span>
                      </div>
                    </div>

                    {/* Cancel Info */}
                    {bookingDetails.canCancel === false && bookingDetails.status?.toLowerCase() !== 'cancelled' && (
                      <div className="col-12">
                        <div className="alert alert-warning d-flex align-items-center">
                          <FaExclamationTriangle className="me-2" />
                          This booking cannot be cancelled as it's less than 24 hours until check-in.
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted">No details available</p>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
                {bookingDetails?.canCancel && bookingDetails.status?.toLowerCase() !== 'cancelled' && (
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleCancelClick(selectedBooking);
                    }}
                  >
                    <FaTimesCircle className="me-2" />
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <FaExclamationTriangle className="me-2" />
                  Confirm Cancellation
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel this booking?</p>
                <div className="bg-light p-3 rounded-3">
                  <p className="mb-1"><strong>Hotel:</strong> {selectedBooking?.hotelName || selectedBooking?.hotel}</p>
                  <p className="mb-1"><strong>Check-in:</strong> {formatDate(selectedBooking?.checkInDate)}</p>
                  <p className="mb-0"><strong>Check-out:</strong> {formatDate(selectedBooking?.checkOutDate)}</p>
                </div>
                <div className="alert alert-warning mt-3 mb-0">
                  <FaExclamationTriangle className="me-2" />
                  Cancellations must be made at least 1 day before check-in date.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelLoading}
                >
                  No, Keep Booking
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleConfirmCancel}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? (
                    <>
                      <FaSpinner className="me-2 spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="me-2" />
                      Yes, Cancel Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserBookings;

