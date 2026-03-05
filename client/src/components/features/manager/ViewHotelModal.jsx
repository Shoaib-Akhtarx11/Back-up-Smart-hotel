import React from 'react';
import { FaBuilding, FaMapMarkerAlt, FaStar, FaCheck, FaTimes, FaEdit } from 'react-icons/fa';

const ViewHotelModal = ({ hotel, onClose, onEdit }) => {
  if (!hotel) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <FaBuilding /> Hotel Details
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Hotel Image */}
            <div className="mb-4">
              <img 
                src={hotel.Image || 'https://via.placeholder.com/600x300?text=Hotel+Image'} 
                alt={hotel.Name}
                className="img-fluid rounded-4 w-100"
                style={{ maxHeight: '300px', objectFit: 'cover' }}
              />
            </div>

            {/* Hotel Name and Location */}
            <div className="mb-4">
              <h3 className="fw-bold mb-2">{hotel.Name}</h3>
              <p className="text-muted mb-0">
                <FaMapMarkerAlt className="me-2" />
                {hotel.Location}
              </p>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <span className="fw-bold me-2">Rating:</span>
              <span className="text-warning">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={i} 
                    className={i < Math.round(hotel.Rating || 0) ? 'text-warning' : 'text-secondary'} 
                  />
                ))}
              </span>
              <span className="ms-2 text-muted">
                ({hotel.Rating?.toFixed(1) || '0.0'} / 5.0)
              </span>
            </div>

            {/* Amenities */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3">Amenities</h6>
              <div className="d-flex flex-wrap gap-2">
                {hotel.Amenities && hotel.Amenities.length > 0 ? (
                  hotel.Amenities.map((amenity, index) => (
                    <span key={index} className="badge bg-light text-dark border">
                      <FaCheck className="text-success me-1" />
                      {amenity}
                    </span>
                  ))
                ) : (
                  <span className="text-muted">No amenities listed</span>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="row g-3">
              <div className="col-md-6">
                <div className="card bg-light">
                  <div className="card-body">
                    <p className="mb-1 text-muted small">Total Rooms</p>
                    <p className="mb-0 fw-bold">{hotel.rooms?.length || 0}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card bg-light">
                  <div className="card-body">
                    <p className="mb-1 text-muted small">Available Rooms</p>
                    <p className="mb-0 fw-bold">
                      {hotel.rooms?.filter(r => r.Availability).length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={onClose}
            >
              <FaTimes className="me-1" /> Close
            </button>
            {onEdit && (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onEdit(hotel);
                }}
              >
                <FaEdit className="me-1" /> Edit Hotel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHotelModal;

