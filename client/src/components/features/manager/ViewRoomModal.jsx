import React from 'react';
import { FaBed, FaHotel, FaDollarSign, FaCheck, FaTimes, FaEdit, FaImage } from 'react-icons/fa';

const ViewRoomModal = ({ room, hotelName, onClose, onEdit }) => {
  if (!room) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <FaBed /> Room Details
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Room Image */}
            <div className="mb-4">
              <img 
                src={room.Image || room.image || 'https://via.placeholder.com/600x300?text=Room+Image'} 
                alt={room.Type}
                className="img-fluid rounded-4 w-100"
                style={{ maxHeight: '250px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x300?text=Room+Image';
                }}
              />
            </div>

            {/* Room Type */}
            <div className="mb-4">
              <h3 className="fw-bold mb-2">
                <FaBed className="me-2 text-primary" />
                {room.Type}
              </h3>
              <p className="text-muted mb-0">
                <FaHotel className="me-2" />
                {hotelName || 'Unknown Hotel'}
              </p>
            </div>

            {/* Price and Availability */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="card bg-light">
                  <div className="card-body">
                    <p className="mb-1 text-muted small">Price per Night</p>
                    <p className="mb-0 fw-bold text-primary fs-4">
                      <FaDollarSign className="me-1" />
                      {room.Price?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card bg-light">
                  <div className="card-body">
                    <p className="mb-1 text-muted small">Availability</p>
                    <p className="mb-0 fw-bold">
                      {room.Availability ? (
                        <span className="text-success">
                          <FaCheck className="me-1" /> Available
                        </span>
                      ) : (
                        <span className="text-danger">
                          <FaTimes className="me-1" /> Unavailable
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Number of Rooms */}
            {room.NumberOfRooms && (
              <div className="mb-4">
                <div className="card bg-light">
                  <div className="card-body">
                    <p className="mb-1 text-muted small">Total Rooms of this Type</p>
                    <p className="mb-0 fw-bold">{room.NumberOfRooms}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mb-3">
              <h6 className="fw-bold mb-3">Room Features</h6>
              <div className="d-flex flex-wrap gap-2">
                {room.Features && room.Features.length > 0 ? (
                  room.Features.map((feature, index) => (
                    <span key={index} className="badge bg-light text-dark border">
                      <FaCheck className="text-success me-1" />
                      {feature}
                    </span>
                  ))
                ) : (
                  <span className="text-muted">No features listed</span>
                )}
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
                  onEdit(room);
                }}
              >
                <FaEdit className="me-1" /> Edit Room
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRoomModal;

