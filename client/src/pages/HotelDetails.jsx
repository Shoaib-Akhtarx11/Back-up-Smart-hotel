import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import NavBar from "../components/layout/NavBar";
import Footer from "../components/layout/Footer";
import RoomList from "../components/features/hotel/RoomList";
import ReviewSection from "../components/features/hotelList/ReviewSection";

// Redux Actions & Selectors
import { addToRecentVisits } from "../redux/userSlice";
import { selectAllHotels } from "../redux/hotelSlice";
import { selectRoomsByHotel, fetchRoomsByHotel } from "../redux/roomSlice";

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Get all hotels from Redux
  const allHotels = useSelector(selectAllHotels);

  // 2. Local UI State
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);

  // 3. Memoized Data Processing
  // We use useMemo to prevent re-filtering rooms every time the image changes
  const roomsByHotel = useSelector(selectRoomsByHotel(id));
  const { hotel, availableRooms } = useMemo(() => {
    try {
      const foundHotel = allHotels.find((h) => String(h._id) === String(id));
      return { hotel: foundHotel, availableRooms: roomsByHotel || [] };
    } catch (err) {
      console.error("Data processing error in HotelDetails:", err);
      return { hotel: null, availableRooms: [] };
    }
  }, [id, allHotels, roomsByHotel]);

  // 4. Effects for Side Effects (Scrolling & Recent Visits)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]); // Only scroll when the hotel ID changes

  // Fetch rooms for this hotel
  useEffect(() => {
    if (id) {
      dispatch(fetchRoomsByHotel(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (hotel) {
      setMainImage(hotel.image);
      dispatch(addToRecentVisits(hotel));
      setLoading(false);
    } else if (allHotels.length > 0) {
      // If we've searched but can't find this specific ID
      setLoading(false);
    }
  }, [id, hotel, allHotels.length, dispatch]);

  const handleQuickBook = () => {
    // Check if any room is actually available
    const roomsWithAvailability = availableRooms.filter(r => r.Availability === true || r.Availability === "true");
    
    if (roomsWithAvailability.length > 0) {
      // Scroll to the Room Selection Section
      const roomsSection = document.getElementById('rooms');
      if (roomsSection) {
        roomsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Show toast message that no rooms are available
      const toast = document.createElement('div');
      toast.className = 'position-fixed bottom-0 start-50 translate-middle-x mb-3 p-3 bg-danger text-white rounded-3 shadow-lg';
      toast.innerHTML = '❌ Sorry, no rooms are currently available. Please try different dates.';
      toast.style.zIndex = '9999';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
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

  // Loading & Error States
  if (loading) return (
    <div className="vh-100 d-flex align-items-center justify-content-center">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  if (!hotel) return (
    <div className="text-center mt-5 py-5 min-vh-100">
      <h3 className="text-danger">Hotel not found.</h3>
      <Link to="/hotelList" className="btn btn-dark mt-3 rounded-pill">Back to Listings</Link>
    </div>
  );

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <NavBar />

      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-bottom py-3 mb-4">
        <div className="container">
          <ol className="breadcrumb mb-0 small">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/hotelList" className="text-decoration-none">Hotels</Link></li>
            <li className="breadcrumb-item active fw-bold text-dark">{hotel.name}</li>
          </ol>
        </div>
      </nav>

      <main className="container mb-5 flex-grow-1">
        <div className="row g-4">
          {/* Left Side: Images */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden animate__animated animate__fadeIn">
              <img 
                src={mainImage} 
                alt={hotel.name} 
                className="img-fluid w-100" 
                style={{ height: "480px", objectFit: "cover", transition: "0.3s" }} 
              />
            </div>
            {/* Thumbnail Gallery */}
            <div className="mt-3 d-flex gap-2 overflow-auto pb-2">
              {[hotel.image, ...(hotel.images || [])].map((img, idx) => (
                <img 
                  key={idx} src={img} alt={`view-${idx}`} 
                  onClick={() => setMainImage(img)}
                  className={`rounded-3 border cursor-pointer thumbnail-img ${mainImage === img ? "border-primary border-2" : "border-light"}`}
                  style={{ width: "100px", height: "70px", objectFit: "cover", flexShrink: 0 }}
                />
              ))}
            </div>
          </div>

          {/* Right Side: Quick Info Card */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4 sticky-top animate__animated animate__fadeInRight" style={{ top: "100px" }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge bg-success-subtle text-success border border-success-subtle">Verified Property</span>
                  <div className="text-warning">{"★".repeat(hotel.stars || 4)}</div>
                </div>
                <h1 className="h3 fw-bold mb-1 text-dark">{hotel.name}</h1>
                <p className="text-muted small mb-4">📍 {hotel.location}</p>
                
                <div className="d-flex align-items-center mb-4 p-3 bg-light rounded-3">
                  <div className="bg-primary text-white rounded-3 px-3 py-2 fw-bold me-3">
                    {hotel.rating}
                  </div>
                  <div>
                    <div className="fw-bold small">{hotel.tag || "Excellent"}</div>
                    <div className="text-muted small">{hotel.reviewsCount} verified reviews</div>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button onClick={handleQuickBook} className="btn btn-primary py-3 fw-bold rounded-pill">
                    Check Availability
                  </button>
                  <button onClick={handleShareProperty} className="btn btn-outline-secondary py-2 rounded-pill small">
                    <i className="bi bi-share me-2"></i>Share Property
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Room Selection Section */}
        <div id="rooms" className="mt-5 pt-4 border-top">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h3 className="fw-bold mb-0">Select Your Room</h3>
            <span className="badge bg-light text-dark border">{availableRooms.length} options available</span>
          </div>
          
          {availableRooms.length > 0 ? (
            <RoomList rooms={availableRooms} hotelId={hotel.id} />
          ) : (
            <div className="text-center py-5 bg-white rounded-4 border">
              <i className="bi bi-calendar-x display-4 text-muted mb-3 d-block"></i>
              <h5>No Rooms Available</h5>
              <p className="text-muted">Try changing your dates or contact the hotel directly.</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-5 pt-4 border-top">
          <ReviewSection hotelId={hotel.id} hotelName={hotel.name} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HotelDetails;