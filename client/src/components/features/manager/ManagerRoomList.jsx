import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaBed, FaEdit, FaTrash, FaPlus, FaSearch, FaHotel, FaEye } from 'react-icons/fa';
import { fetchManagerDashboardData, selectManagerDashboardData } from '../../../redux/managerSlice';
import ViewRoomModal from './ViewRoomModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5600/api';

const ManagerRoomList = ({ onAddRoom, onEditRoom, onDeleteRoom }) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState('all');
  const [viewingRoom, setViewingRoom] = useState(null);

  const handleView = (room) => {
    setViewingRoom(room);
  };

  const handleViewEdit = (room) => {
    setViewingRoom(null);
    if (onEditRoom) {
      onEditRoom(room);
    }
  };
  
  // Get data directly from Redux manager slice
  const dashboardData = useSelector(selectManagerDashboardData);
  
  // Get hotels and rooms from dashboard data
  const hotels = dashboardData?.hotels || [];
  const rooms = dashboardData?.rooms || [];
  
  // Get manager's hotel IDs
  const managerHotelIds = hotels.map(h => h._id || h.id);
  
  // Filter rooms for manager's hotels
  const managerRooms = rooms.filter(room => {
    const roomHotelId = room.HotelID?._id || room.HotelID || room.hotelId;
    return managerHotelIds.includes(roomHotelId) || managerHotelIds.includes(String(roomHotelId));
  });
  
  // Filter rooms
  const filteredRooms = managerRooms.filter(room => {
    const hotel = hotels.find(h => (h._id || h.id) === (room.HotelID?._id || room.HotelID || room.hotelId));
    const hotelName = hotel?.Name || '';
    
    const matchesSearch = 
      room.Type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotelName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesHotel = selectedHotel === 'all' || 
      (room.HotelID?._id || room.HotelID || room.hotelId) === selectedHotel;
    
    return matchesSearch && matchesHotel;
  });

  // Helper function to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  };

  const getHotelName = (hotelId) => {
    const hotel = hotels.find(h => (h._id || h.id) === (hotelId?._id || hotelId));
    return hotel?.Name || 'Unknown Hotel';
  };

  const handleDelete = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const response = await fetch(`${API_URL}/rooms/${roomId}`, {
          method: 'DELETE',
          ...getAuthHeader(),
        });
        const data = await response.json();
        if (data.success) {
          alert('Room deleted successfully!');
          dispatch(fetchManagerDashboardData());
        } else {
          alert(data.message || 'Failed to delete room');
        }
      } catch (err) {
        console.error('Error deleting room:', err);
        alert('Failed to delete room. Please try again.');
      }
    }
  };

  const handleEdit = (room) => {
    if (onEditRoom && onEditRoom.onEdit) {
      onEditRoom.onEdit(room);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Room Management</h4>
          <p className="text-muted small mb-0">Manage rooms across all your hotels</p>
        </div>
        {hotels.length > 0 && (
          <button 
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => onAddRoom && onAddRoom()}
          >
            <FaPlus /> Add Room
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="row mb-4 g-3">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by room type or hotel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedHotel}
            onChange={(e) => setSelectedHotel(e.target.value)}
          >
            <option value="all">All Hotels</option>
            {hotels.map(hotel => (
              <option key={hotel._id || hotel.id} value={hotel._id || hotel.id}>
                {hotel.Name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* No Hotels Message */}
      {hotels.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1 mb-3">🏨</div>
          <h5 className="fw-bold">No Hotels Available</h5>
          <p className="text-muted mb-3">
            You need to add a hotel first before managing rooms.
          </p>
        </div>
      ) : filteredRooms.length > 0 ? (
        /* Room Cards */
        <div className="row g-4">
          {filteredRooms.map((room) => (
            <div key={room._id || room.id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="position-relative">
                  <img
                    src={room.Image || 'https://via.placeholder.com/300x200?text=Room'}
                    alt={room.Type}
                    className="card-img-top"
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                  <span className={`position-absolute top-0 end-0 badge m-2 ${
                    room.Availability ? 'bg-success' : 'bg-danger'
                  }`}>
                    {room.Availability ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-1">
                    <FaBed className="me-2 text-primary" />
                    {room.Type}
                  </h5>
                  <p className="text-muted small mb-2">
                    <FaHotel className="me-1" />
                    {getHotelName(room.HotelID?._id || room.HotelID || room.hotelId)}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="fw-bold text-primary fs-5">
                        ₹{room.Price?.toLocaleString() || '0'}
                      </span>
                      <span className="text-muted small">/night</span>
                    </div>
                  </div>
                  {room.Features && room.Features.length > 0 && (
                    <div className="mt-2">
                      {room.Features.slice(0, 3).map((feature, idx) => (
                        <span key={idx} className="badge bg-light text-dark me-1 mb-1">
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="card-footer bg-white border-top-0">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary flex-grow-1"
                      onClick={() => handleView(room)}
                    >
                      <FaEye className="me-1" /> View
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary flex-grow-1"
                      onClick={() => handleEdit(room)}
                    >
                      <FaEdit className="me-1" /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(room._id || room.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="fs-1 mb-3">🛏️</div>
          <h5 className="fw-bold">No Rooms Found</h5>
          <p className="text-muted mb-3">
            {searchTerm || selectedHotel !== 'all' 
              ? 'No rooms match your search criteria.' 
              : 'Start by adding rooms to your hotels.'}
          </p>
          {!searchTerm && selectedHotel === 'all' && hotels.length > 0 && (
            <button className="btn btn-primary" onClick={() => onAddRoom && onAddRoom()}>
              <FaPlus className="me-2" /> Add First Room
            </button>
          )}
        </div>
      )}

      {/* View Room Modal */}
      {viewingRoom && (
        <ViewRoomModal 
          room={viewingRoom}
          hotelName={getHotelName(viewingRoom.HotelID?._id || viewingRoom.HotelID || viewingRoom.hotelId)}
          onClose={() => setViewingRoom(null)}
          onEdit={handleViewEdit}
        />
      )}
    </div>
  );
};

export default ManagerRoomList;

