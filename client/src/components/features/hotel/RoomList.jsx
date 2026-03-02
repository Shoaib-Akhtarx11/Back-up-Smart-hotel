import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToRecentVisits } from '../../../redux/userSlice';
import { selectAllHotels } from '../../../redux/hotelSlice';

const RoomList = ({ rooms, hotelId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Using our centralized selector
  const allHotels = useSelector(selectAllHotels);

  const handleBooking = (room) => {
    try {
      // 1. Find current hotel safely for history tracking
      const currentHotel = allHotels?.find(h => String(h.id) === String(hotelId));
      
      if (currentHotel) {
        dispatch(addToRecentVisits(currentHotel));
      }

      // 2. Navigate to booking route
      if (room?.id && hotelId) {
        navigate(`/booking/${hotelId}/${room.id}`);
      } else {
        throw new Error("Missing Room or Hotel ID");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      // Friendly UI fallback
      alert("We encountered an issue preparing your booking. Please try refreshing the page.");
    }
  };

  // Empty State
  if (!rooms || rooms.length === 0) {
    return (
      <div className="alert alert-info rounded-4 border-0 shadow-sm p-5 text-center">
        <i className="bi bi-info-circle fs-1 d-block mb-3 text-primary opacity-50"></i>
        <h5 className="fw-bold">No rooms available for online booking</h5>
        <p className="text-muted mb-0">Please contact the hotel directly to inquire about last-minute availability.</p>
      </div>
    );
  }

  return (
    <div className="row g-4 animate__animated animate__fadeInUp">
      {rooms.map((room) => {
        try {
          if (!room || !room.type) throw new Error("Malformed Room Data");

          const isAvailable = room.availability === true || room.availability === "true";

          return (
            <div key={room.id || Math.random()} className="col-md-6 col-xl-4">
              <div className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden transition-all ${isAvailable ? 'room-card-hover' : 'opacity-75'}`}>
                
                {/* Image Section with Overlay for Sold Out */}
                <div style={{ height: "200px", position: "relative", overflow: 'hidden' }}>
                   <img 
                     src={room.image || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"} 
                     alt={room.type} 
                     className="w-100 h-100 hotel-img-zoom" 
                     style={{ objectFit: 'cover' }}
                     loading="lazy"
                     onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"; }}
                   />
                   {!isAvailable && (
                     <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
                          style={{ background: "rgba(0,0,0,0.7)", color: "#fff", zIndex: 2 }}>
                       <span className="fw-bold text-uppercase border border-2 p-2 px-3 tracking-widest">Sold Out</span>
                     </div>
                   )}
                </div>
                
                <div className="card-body p-4 d-flex flex-column">
                  {/* Room Title & Status */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-bold mb-0 text-dark">{room.type}</h5>
                      <small className="text-muted">{room.size || "Standard Size"}</small>
                    </div>
                    <span className={`badge rounded-pill px-3 py-2 ${isAvailable ? 'bg-success-subtle text-success' : 'bg-light text-muted'}`}>
                      {isAvailable ? "Available" : "Full"}
                    </span>
                  </div>
                  
                  {/* Features List */}
                  <div className="mb-4 flex-grow-1">
                    <div className="row g-2">
                      {room.features?.slice(0, 4).map((feature, index) => (
                        <div key={index} className="col-6">
                          <span className="text-muted small d-flex align-items-center">
                            <i className="bi bi-check2 text-primary me-2"></i>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                    <div>
                      <span className="text-muted xsmall d-block" style={{ fontSize: '11px' }}>Per Night</span>
                      <h4 className="fw-bold text-dark mb-0">
                        ₹{room.price ? Number(room.price).toLocaleString() : "---"}
                      </h4>
                    </div>
                    
                    <button 
                      onClick={() => handleBooking(room)}
                      className={`btn ${isAvailable ? 'btn-primary' : 'btn-secondary disabled'} px-4 fw-bold rounded-pill shadow-sm transition-all`}
                      disabled={!isAvailable}
                    >
                      {isAvailable ? 'Book' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        } catch (itemError) {
          console.error("Card Render Error:", itemError);
          return null; 
        }
      })}
    </div>
  );
};

export default RoomList;