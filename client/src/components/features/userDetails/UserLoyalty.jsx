import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTrophy, FaGift, FaHistory, FaHotel, FaPlus, FaMinus, FaCoins } from "react-icons/fa";
import { 
  fetchUserLoyalty, 
  purchaseRedemptionPoints,
  clearRedemptionStatus,
  selectUserLoyalty,
  selectLoyaltyLoading,
  selectRedemptionLoading,
  selectRedemptionError,
  selectRedemptionSuccess,
  selectLoyaltyPoints,
  selectRedemptionPoints,
  selectLoyaltyHistory
} from "../../../redux/loyaltySlice";

const UserLoyalty = ({ currentUser }) => {
  const dispatch = useDispatch();
  
  // Redux state
  const loyalty = useSelector(selectUserLoyalty);
  const loading = useSelector(selectLoyaltyLoading);
  const redemptionLoading = useSelector(selectRedemptionLoading);
  const redemptionError = useSelector(selectRedemptionError);
  const redemptionSuccess = useSelector(selectRedemptionSuccess);
  const loyaltyPoints = useSelector(selectLoyaltyPoints);
  const redemptionPoints = useSelector(selectRedemptionPoints);
  const history = useSelector(selectLoyaltyHistory);
  
  // Local state for purchase modal
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [pointsToPurchase, setPointsToPurchase] = useState(0);
  const [purchaseMessage, setPurchaseMessage] = useState("");

  useEffect(() => {
    // Fetch loyalty data on mount
    dispatch(fetchUserLoyalty());
  }, [dispatch, currentUser?.id, currentUser?._id]);

  // Clear redemption status when modal closes
  useEffect(() => {
    if (!showPurchaseModal) {
      dispatch(clearRedemptionStatus());
      setPurchaseMessage("");
      setPointsToPurchase(0);
    }
  }, [showPurchaseModal, dispatch]);

  // Show success/error messages
  useEffect(() => {
    if (redemptionSuccess) {
      setPurchaseMessage("Successfully converted loyalty points to redemption points!");
      // Refresh loyalty data
      setTimeout(() => {
        dispatch(fetchUserLoyalty());
      }, 1500);
    }
    if (redemptionError) {
      setPurchaseMessage(redemptionError);
    }
  }, [redemptionSuccess, redemptionError, dispatch]);

  // Calculate tier based on loyalty points
  const getTierInfo = (points) => {
    if (points >= 10000) return { name: "Platinum", color: "#4361ee", bg: "linear-gradient(135deg, #4361ee 0%, #7209b7 100%)" };
    if (points >= 5000) return { name: "Gold", color: "#ffc107", bg: "linear-gradient(135deg, #ffc107 0%, #ff9800 100%)" };
    if (points >= 1000) return { name: "Silver", color: "#9e9e9e", bg: "linear-gradient(135deg, #9e9e9e 0%, #607d8b 100%)" };
    return { name: "Bronze", color: "#cd7f32", bg: "linear-gradient(135deg, #cd7f32 0%, #8b4513 100%)" };
  };

  const tier = getTierInfo(loyaltyPoints);

  // Handle purchase redemption points
  const handlePurchase = () => {
    if (pointsToPurchase <= 0) {
      setPurchaseMessage("Please enter a valid number of points");
      return;
    }
    if (pointsToPurchase > loyaltyPoints) {
      setPurchaseMessage(`You only have ${loyaltyPoints} loyalty points`);
      return;
    }
    dispatch(purchaseRedemptionPoints(pointsToPurchase));
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <div className="bg-warning bg-opacity-10 p-3 rounded-3 me-3">
              <FaTrophy className="text-warning fs-4" />
            </div>
            <div>
              <h4 className="fw-bold mb-0">Loyalty Points</h4>
              <p className="text-muted small mb-0">Earn rewards with every booking</p>
            </div>
          </div>
        </div>

        {/* Points Summary Card */}
        <div
          className="card border-0 text-white mb-4"
          style={{
            background: tier.bg,
            borderRadius: "20px",
          }}
        >
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <p className="small mb-1 opacity-75">Welcome back, {currentUser?.name || currentUser?.Name || "Traveler"}!</p>
                <div className="d-flex align-items-baseline">
                  <h1 className="display-3 fw-bold mb-0 me-2">
                    {Number(loyaltyPoints || 0).toLocaleString()}
                  </h1>
                  <span className="opacity-75">points</span>
                </div>
                <div className="mt-3">
                  <span className="badge bg-white bg-opacity-25 text-white px-3 py-2 rounded-pill">
                    <FaTrophy className="me-1" />
                    {tier.name} Member
                  </span>
                </div>
              </div>
              <div className="col-md-4 text-md-end">
                <div className="fs-1 mb-2 opacity-50">
                  <FaTrophy />
                </div>
                <p className="small mb-0 opacity-75">
                  <strong>1 Point = ₹1</strong><br />discount on booking
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Redemption Points Display */}
        {redemptionPoints > 0 && (
          <div className="card border-0 bg-success bg-opacity-10 mb-4 rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="bg-success p-3 rounded-3 me-3">
                    <FaCoins className="text-white fs-4" />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-success">Redemption Points</h5>
                    <p className="text-muted small mb-0">Use these for discounts on bookings</p>
                  </div>
                </div>
                <div className="text-end">
                  <h2 className="fw-bold text-success mb-0">{Number(redemptionPoints || 0).toLocaleString()}</h2>
                  <small className="text-muted">points available</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card border-0 bg-light rounded-4 p-4 h-100">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success bg-opacity-10 p-2 rounded-3 me-3">
                  <FaGift className="text-success" />
                </div>
                <h5 className="fw-bold mb-0">Buy Redemption Points</h5>
              </div>
              <p className="text-muted small mb-3">Convert your loyalty points to redemption points at 1:1 ratio!</p>
              <button 
                className="btn btn-success rounded-pill w-100"
                onClick={() => setShowPurchaseModal(true)}
                disabled={loyaltyPoints === 0}
              >
                Convert Points
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 bg-light rounded-4 p-4 h-100">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                  <FaHotel className="text-primary" />
                </div>
                <h5 className="fw-bold mb-0">Earn More</h5>
              </div>
              <p className="text-muted small mb-3">Book hotels to earn more loyalty points!</p>
              <Link to="/hotelList" className="btn btn-primary rounded-pill w-100">
                Book Now
              </Link>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">
            <FaHistory className="me-2 text-muted" />
            Points History
          </h5>
          <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
            {history?.length || 0} Activities
          </span>
        </div>

        {history && history.length > 0 ? (
          <div className="card border-0 bg-light rounded-4 overflow-hidden">
            <ul className="list-group list-group-flush">
              {[...history].reverse().slice(0, 5).map((item, index) => (
                <li
                  key={item._id || index}
                  className="list-group-item d-flex justify-content-between align-items-center py-3 px-4 bg-transparent border-bottom"
                >
                  <div className="d-flex align-items-center">
                    <div className={`p-2 rounded-3 me-3 ${
                      item.type === 'earned' ? 'bg-success bg-opacity-10' : 
                      item.type === 'purchase' ? 'bg-warning bg-opacity-10' : 'bg-danger bg-opacity-10'
                    }`}>
                      {item.type === 'earned' ? (
                        <FaPlus className="text-success" />
                      ) : item.type === 'purchase' ? (
                        <FaCoins className="text-warning" />
                      ) : (
                        <FaMinus className="text-danger" />
                      )}
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">{item.Description || `Points ${item.type}`}</h6>
                      <small className="text-muted">{formatDate(item.Date)}</small>
                    </div>
                  </div>
                  <span className={`fw-bold fs-5 ${
                    item.type === 'earned' ? 'text-success' : 
                    item.type === 'purchase' ? 'text-warning' : 'text-danger'
                  }`}>
                    {item.type === 'earned' ? '+' : '-'}{item.Points || 0}
                  </span>
                </li>
              ))}
            </ul>
            {history.length > 5 && (
              <div className="text-center py-3 border-top">
                <Link to="/loyalty" className="btn btn-outline-primary btn-sm rounded-pill">
                  View All History
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-5 bg-light rounded-4 border">
            <div className="fs-1 mb-3">🏆</div>
            <h5 className="fw-bold">No Points Yet</h5>
            <p className="text-muted mb-3">Book a hotel to earn loyalty points!</p>
            <Link to="/hotelList" className="btn btn-primary rounded-pill">
              Start Booking
            </Link>
          </div>
        )}

        {/* Purchase Redemption Points Modal */}
        {showPurchaseModal && (
          <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold">
                    <FaCoins className="me-2 text-warning" />
                    Buy Redemption Points
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowPurchaseModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-4">
                    <p className="text-muted mb-2">Your Current Loyalty Points:</p>
                    <h3 className="fw-bold text-primary">{Number(loyaltyPoints || 0).toLocaleString()}</h3>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold">Points to Convert</label>
                    <input
                      type="number"
                      className="form-control form-control-lg rounded-3"
                      placeholder="Enter points to convert"
                      value={pointsToPurchase}
                      onChange={(e) => setPointsToPurchase(parseInt(e.target.value) || 0)}
                      min="1"
                      max={loyaltyPoints}
                    />
                    <small className="text-muted">1 Loyalty Point = 1 Redemption Point</small>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">You'll get:</span>
                    <span className="fw-bold text-success fs-5">
                      {Number(pointsToPurchase || 0).toLocaleString()} Redemption Points
                    </span>
                  </div>

                  {purchaseMessage && (
                    <div className={`alert ${redemptionSuccess ? 'alert-success' : 'alert-danger'} py-2`}>
                      {purchaseMessage}
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0">
                  <button 
                    type="button" 
                    className="btn btn-light rounded-pill" 
                    onClick={() => setShowPurchaseModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success rounded-pill"
                    onClick={handlePurchase}
                    disabled={redemptionLoading || pointsToPurchase <= 0 || pointsToPurchase > loyaltyPoints}
                  >
                    {redemptionLoading ? 'Converting...' : 'Convert Points'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLoyalty;

