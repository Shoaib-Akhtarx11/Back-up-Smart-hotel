import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaBuilding, FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import { fetchManagerDashboardData, selectManagerDashboardData } from '../../../redux/managerSlice';
import EditHotelModal from './EditHotelModal';
import ViewHotelModal from './ViewHotelModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5600/api';

const ManagerHotelList = ({ onAddHotel, onEditHotel, onViewHotel }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingHotel, setEditingHotel] = useState(null);
  const [viewingHotel, setViewingHotel] = useState(null);
  
  // Get data directly from Redux manager slice
  const dashboardData = useSelector(selectManagerDashboardData);
  const managerState = useSelector((state) => state.manager);
  
  // Get hotels from dashboard data
  const managerHotels = dashboardData?.hotels || [];
  
  // Filter hotels by search term
  const filteredHotels = managerHotels.filter(hotel =>
    hotel.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.Location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleDelete = async (hotelId) => {
    if (window.confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
      try {
        const response = await fetch(`${API_URL}/hotels/${hotelId}`, {
          method: 'DELETE',
          ...getAuthHeader(),
        });
        const data = await response.json();
        if (data.success) {
          alert('Hotel deleted successfully!');
          // Refresh the dashboard data
          dispatch(fetchManagerDashboardData());
        } else {
          alert(data.message || 'Failed to delete hotel');
        }
      } catch (err) {
        console.error('Error deleting hotel:', err);
        alert('Failed to delete hotel. Please try again.');
      }
    }
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
  };

  const handleView = (hotel) => {
    setViewingHotel(hotel);
  };

  const handleEditSuccess = () => {
    setEditingHotel(null);
    dispatch(fetchManagerDashboardData());
  };

  const handleViewEdit = (hotel) => {
    setViewingHotel(null);
    setEditingHotel(hotel);
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">My Hotels</h4>
          <p className="text-muted small mb-0">Manage your hotel properties</p>
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={onAddHotel}
        >
          <FaPlus /> Add Hotel
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search hotels by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Hotel Cards */}
      {filteredHotels.length > 0 ? (
        <div className="row g-4">
          {filteredHotels.map((hotel) => (
            <div key={hotel._id || hotel.id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="position-relative">
                  <img
                    src={hotel.Image || 'https://via.placeholder.com/300x200?text=Hotel'}
                    alt={hotel.Name}
                    className="card-img-top"
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <span className="position-absolute top-0 end-0 badge bg-success m-2">
                    Active
                  </span>
                </div>
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-1">{hotel.Name}</h5>
                  <p className="text-muted small mb-2">
                    <FaBuilding className="me-1" />
                    {hotel.Location}
                  </p>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="text-warning">
                      {'★'.repeat(Math.round(hotel.Rating || 0))}
                      <span className="text-muted ms-1">
                        ({hotel.Rating?.toFixed(1) || '0.0'})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-white border-top-0">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary flex-grow-1"
                      onClick={() => handleView(hotel)}
                    >
                      <FaEye className="me-1" /> View
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary flex-grow-1"
                      onClick={() => handleEdit(hotel)}
                    >
                      <FaEdit className="me-1" /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(hotel._id || hotel.id)}
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
          <div className="fs-1 mb-3">🏨</div>
          <h5 className="fw-bold">No Hotels Yet</h5>
          <p className="text-muted mb-3">
            {searchTerm ? 'No hotels match your search criteria.' : 'Start by adding your first hotel property.'}
          </p>
          {!searchTerm && (
            <button className="btn btn-primary" onClick={onAddHotel}>
              <FaPlus className="me-2" /> Add Your First Hotel
            </button>
          )}
        </div>
      )}

      {/* Edit Hotel Modal */}
      {editingHotel && (
        <EditHotelModal 
          hotel={editingHotel}
          onClose={() => setEditingHotel(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* View Hotel Modal */}
      {viewingHotel && (
        <ViewHotelModal 
          hotel={viewingHotel}
          onClose={() => setViewingHotel(null)}
          onEdit={handleViewEdit}
        />
      )}
    </div>
  );
};

export default ManagerHotelList;

