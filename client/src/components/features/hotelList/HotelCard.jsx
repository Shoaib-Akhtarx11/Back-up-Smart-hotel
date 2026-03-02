import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToRecentVisits } from "../../../redux/userSlice";
import styles from "./HotelCard.module.css";

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /**
   * NOTE: hotel.minPrice is now pre-calculated in the Redux Selector!
   * No need to import roomsData or filter here.
   */

  const handleViewDeal = () => {
    try {
      // 1. Log the visit for the "Recent Visits" feature
      dispatch(addToRecentVisits(hotel));
      
      // 2. Navigate to detailed view
      navigate(`/hotel/${hotel.id}`);
    } catch (error) {
      console.error("Navigation Error:", error);
    }
  };

  const handleShareProperty = () => {
    // Show toast message that feature is unavailable
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 start-50 translate-middle-x mb-3 p-3 bg-warning text-dark rounded-3 shadow-lg';
    toast.innerHTML = '⚠️ Share property feature is currently unavailable. Thank you for your interest!';
    toast.style.zIndex = '9999';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <div className={`card mb-4 shadow-sm border-0 ${styles.hotelCard} animate__animated animate__fadeIn`}>
      <div className="row g-0">
        {/* Image Section */}
        <div className="col-md-4 p-3 position-relative">
          <div className={styles.imageWrapper}>
            <img 
              src={hotel.image} 
              className={styles.hotelImg} 
              alt={hotel.name} 
              loading="eager"
            />
          </div>
          <button className={styles.wishlistBtn} aria-label="Add to wishlist">♡</button>
        </div>

        {/* Info Section */}
        <div className="col-md-5 p-3 d-flex flex-column justify-content-between">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className={styles.stars}>{"★".repeat(hotel.stars || 4)}</span>
              <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '10px' }}>Hotel</small>
            </div>
            <h5 className="fw-bold mb-1 text-dark">{hotel.name}</h5>
            <p className="text-muted small mb-2">
              <i className="bi bi-geo-alt-fill me-1"></i>{hotel.location}
            </p>
            
            {/* Displaying Features (Pre-calculated in slice) */}
            <div className="d-flex flex-column gap-1">
              {(hotel.features || []).slice(0, 3).map((f, i) => (
                <div key={i} className="text-success small d-flex align-items-center gap-1">
                  <i className="bi bi-check2-circle"></i> {f}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 d-flex align-items-center">
            <span className={styles.ratingBadge}>{hotel.rating || "N/A"}</span>
            <div className="ms-2">
              <div className="fw-bold small lh-1">{hotel.tag || "Recommended"}</div>
              <div className="text-muted xsmall" style={{ fontSize: '11px' }}>
                ({hotel.reviewsCount?.toLocaleString() || 0} reviews)
              </div>
            </div>
          </div>
        </div>

        {/* Price & CTA Section */}
        <div className={`col-md-3 border-start p-3 bg-light bg-opacity-25 d-flex flex-column ${styles.priceSection}`}>
          <div className="text-danger small fw-bold mt-1">Our lowest price</div>
          
          <div className="mt-2">
            <div className="small fw-bold text-secondary">{hotel.provider || "Official Site"}</div>
            {hotel.offer && hotel.offer !== "No current offer for now" ? (
              <div className="badge bg-success-subtle text-success border border-success-subtle mt-1 d-block text-start p-2" style={{ fontSize: "10px" }}>
                <i className="bi bi-patch-check-fill me-1"></i> {hotel.offer}
              </div>
            ) : (
              <div className="text-muted mt-1 d-block text-start" style={{ fontSize: "10px", fontStyle: "italic" }}>
                Standard Rates Apply
              </div>
            )}
          </div>

          <div className="mt-auto">
            <div className="text-muted small mb-0">Starting from</div>
            <h3 className="fw-bold mb-0 text-primary">
              {hotel.minPrice > 0 && hotel.minPrice !== 999999 
                ? `₹${Number(hotel.minPrice).toLocaleString()}` 
                : "Check Dates"}
            </h3>
            <button 
              className={`btn btn-primary w-100 mt-2 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 ${styles.viewDealBtn}`} 
              onClick={handleViewDeal}
            >
              View Deal <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;