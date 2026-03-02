import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import NavBar from "../components/layout/NavBar";
import Footer from "../components/layout/Footer";
import { getUserLoyalty } from "../utils/userDataManager";

const LoyaltyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userLoyalty, setUserLoyalty] = useState({ pointsBalance: 0, history: [] });

  // Pulling current logged-in user from 'state.auth'
  const auth = useSelector((state) => state.auth || {});
  const currentUser = auth.user;

  // Get the success message passed from BookingPage.jsx
  const successMessage = location.state?.successMessage;

  // Load user-specific loyalty points when component mounts or user changes
  useEffect(() => {
    if (currentUser?.id) {
      const userLoyalty = getUserLoyalty(currentUser.id);
      setUserLoyalty(userLoyalty);
    }
  }, [currentUser?.id]);

  // Refresh loyalty data when success message appears (after booking)
  useEffect(() => {
    if (successMessage && currentUser?.id) {
      // Small delay to ensure localStorage was updated
      setTimeout(() => {
        const userLoyalty = getUserLoyalty(currentUser.id);
        setUserLoyalty(userLoyalty);
      }, 100);
    }
  }, [successMessage, currentUser?.id]);

  const loyaltyPoints = userLoyalty?.pointsBalance || 0;
  const history = userLoyalty?.history || [];

  // 2. Auth Protection (Optional)
  React.useEffect(() => {
    if (!auth.isAuthenticated && !auth.loading) {
      // navigate("/login"); 
    }
  }, [auth.isAuthenticated, auth.loading, navigate]);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <NavBar />
      
      <main className="flex-grow-1 container mt-5 mb-5 animate__animated animate__fadeIn">
        
        {/* 1. Success Message (Shows only after a successful booking) */}
        {successMessage && (
          <div className="alert alert-success border-0 shadow-sm rounded-4 p-4 mb-5 animate__animated animate__tada text-center">
            <i className="bi bi-check-circle-fill fs-1 d-block mb-2 text-success"></i>
            <h4 className="fw-bold mb-0">{successMessage}</h4>
          </div>
        )}

        {/* 2. Points Summary Card */}
        <div
          className="card border-0 shadow-lg text-white mb-5"
          style={{
            background: "linear-gradient(135deg, #4361ee 0%, #7209b7 100%)",
            borderRadius: "24px",
          }}
        >
          <div className="card-body p-5 text-center">
            <div className="mb-3">
              <i className="bi bi-stars fs-1 text-warning"></i>
            </div>
            <p className="lead mb-2 opacity-75">
              Welcome back, {currentUser?.name || "Traveler"}!
            </p>
            <h1 className="display-2 fw-bold mb-0">
              {/* FIX: Safe Number conversion + toLocaleString */}
              {Number(loyaltyPoints || 0).toLocaleString()}
            </h1>
            <p className="lead opacity-75 text-uppercase tracking-wider small">
              Total Reward Points
            </p>
            
            <div className="mt-4 d-flex justify-content-center gap-3">
              <Link to="/hotelList" className="btn btn-light rounded-pill px-4 fw-bold shadow-sm">
                Book More
              </Link>
              <button className="btn btn-outline-light rounded-pill px-4 fw-bold" disabled>
                Redeem (Coming Soon)
              </button>
            </div>
          </div>
        </div>

        {/* 3. Transaction History Section */}
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Transaction History</h4>
              <span className="badge bg-white text-primary border shadow-sm p-2 px-3 rounded-pill">
                {history?.length || 0} Activities
              </span>
            </div>

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <ul className="list-group list-group-flush">
                {history && history.length > 0 ? (
                  // Reversing to show newest first
                  [...history].reverse().map((item, index) => (
                    <li
                      key={item.id || index}
                      className="list-group-item d-flex justify-content-between align-items-center py-3 px-4 border-light"
                    >
                      <div className="d-flex align-items-center">
                        <div className="p-3 bg-primary bg-opacity-10 rounded-3 me-3">
                          <i className="bi bi-building text-primary"></i>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{item.activity || "Hotel Stay"}</h6>
                          <small className="text-muted">{item.date || "Completed"}</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="fw-bold fs-5 text-success">
                          +{item.points}
                        </span>
                        <small className="text-muted d-block" style={{ fontSize: '10px' }}>POINTS</small>
                      </div>
                    </li>
                  ))
                ) : (
                  <div className="text-center py-5 bg-white">
                    <i className="bi bi-clock-history display-1 text-light mb-3 d-block"></i>
                    <h5 className="text-dark fw-bold">No points yet</h5>
                    <p className="text-muted px-4">
                      Points earned from your future hotel bookings will appear here.
                    </p>
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoyaltyPage;