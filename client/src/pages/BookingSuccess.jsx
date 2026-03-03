import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaCheck, FaHotel, FaCalendar, FaClock, FaUser, FaMoneyBillWave, FaPrint } from 'react-icons/fa';
import NavBar from '../components/layout/NavBar';
import Footer from '../components/layout/Footer';

const BookingSuccess = () => {
  const location = useLocation();
  const bookingData = location.state?.bookingData;

  if (!bookingData) {
    return (
      <div className="bg-light min-vh-100">
        <NavBar />
        <div className="container py-5 text-center">
          <h2>No booking information found</h2>
          <p>Please make a booking first.</p>
          <Link to="/" className="btn btn-primary">Go to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { 
    hotelName, 
    roomType, 
    userName, 
    userEmail,
    checkInDate, 
    checkOutDate,
    checkInTime,
    checkOutTime,
    totalAmount,
    bookingId,
    paymentId,
    pointsEarned,
    nights
  } = bookingData;

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-light min-vh-100">
      <NavBar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Success Message */}
            <div className="text-center mb-4">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" 
                   style={{ width: '100px', height: '100px' }}>
                <FaCheck className="fs-1 text-success" />
              </div>
              <h2 className="mt-3 fw-bold text-success">Booking Confirmed!</h2>
              <p className="text-muted">Your booking has been successfully processed.</p>
            </div>

            {/* Booking Details Card */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-primary text-white py-3">
                <h5 className="mb-0"><FaHotel className="me-2" />Booking Details</h5>
              </div>
              <div className="card-body p-4">
                {/* Booking ID */}
                <div className="text-center mb-4 pb-4 border-bottom">
                  <p className="text-muted mb-1">Booking ID</p>
                  <h4 className="text-primary fw-bold">{bookingId}</h4>
                </div>

                {/* Hotel & Room Info */}
                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <p className="text-muted small mb-1">Hotel</p>
                    <h5 className="fw-bold">{hotelName}</h5>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-1">Room Type</p>
                    <h5 className="fw-bold">{roomType}</h5>
                  </div>
                </div>

                {/* Guest Info */}
                <div className="row mb-4 pb-4 border-bottom">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <p className="text-muted small mb-1"><FaUser className="me-1" />Guest Name</p>
                    <h6 className="fw-bold">{userName}</h6>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-1">Email</p>
                    <h6 className="fw-bold">{userEmail}</h6>
                  </div>
                </div>

                {/* Check-in/Check-out */}
                <div className="row mb-4 pb-4 border-bottom">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <p className="text-muted small mb-1"><FaCalendar className="me-1" />Check-in</p>
                    <h6 className="fw-bold">{formatDate(checkInDate)}</h6>
                    <p className="text-primary"><FaClock className="me-1" />{checkInTime}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-1"><FaCalendar className="me-1" />Check-out</p>
                    <h6 className="fw-bold">{formatDate(checkOutDate)}</h6>
                    <p className="text-primary"><FaClock className="me-1" />{checkOutTime}</p>
                  </div>
                </div>

                {/* Stay Duration */}
                <div className="row mb-4 pb-4 border-bottom">
                  <div className="col-12">
                    <p className="text-muted small mb-1">Stay Duration</p>
                    <h6 className="fw-bold">{nights} {nights === 1 ? 'Night' : 'Nights'}</h6>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="row">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <p className="text-muted small mb-1"><FaMoneyBillWave className="me-1" />Total Amount Paid</p>
                    <h4 className="fw-bold text-success">₹{parseFloat(totalAmount).toLocaleString()}</h4>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-1">Payment ID</p>
                    <h6 className="fw-bold">{paymentId || 'N/A'}</h6>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty Points */}
            {pointsEarned > 0 && (
              <div className="card border-0 shadow-sm rounded-4 mb-4 bg-success bg-opacity-10">
                <div className="card-body p-4 text-center">
                  <h5 className="text-success fw-bold">🎉 Congratulations!</h5>
                  <p className="mb-0">You've earned <strong>{pointsEarned.toLocaleString()} loyalty points</strong> with this booking.</p>
                  <p className="text-muted small mb-0">Use these points for future bookings or redeem for rewards!</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
              <button onClick={handlePrint} className="btn btn-outline-primary rounded-pill px-4">
                <FaPrint className="me-2" /> Print Receipt
              </button>
              <Link to="/account" className="btn btn-primary rounded-pill px-4">
                View My Bookings
              </Link>
              <Link to="/" className="btn btn-outline-secondary rounded-pill px-4">
                Back to Home
              </Link>
            </div>

            {/* Help Text */}
            <p className="text-center text-muted mt-4 mb-0">
              A confirmation email has been sent to your registered email address.
              <br />
              For any queries, contact our support team.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingSuccess;

