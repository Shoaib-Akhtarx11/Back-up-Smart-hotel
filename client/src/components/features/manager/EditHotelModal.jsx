import React, { useState } from 'react';
import { FaBuilding, FaEdit, FaTimes, FaStar, FaMapMarkerAlt, FaImage } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5600/api';

const EditHotelModal = ({ hotel, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    Name: hotel?.Name || '',
    Location: hotel?.Location || '',
    Rating: hotel?.Rating || 5.0,
    Amenities: hotel?.Amenities || [],
    Image: hotel?.Image || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const availableAmenities = [
    'Free WiFi', 'Pool', 'Breakfast included', 'Gym', 'Spa', 
    'Restaurant', 'Free cancellation', 'Concierge', 'Business Center', 
    'Fitness Center', 'Sea View', 'City View', 'Garden View', 
    'Mountain View', 'Travel Desk', 'Lake View', 'Heritage Building', 
    'Nightlife Access', 'Luxury Spa', 'Club Access'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Rating' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      Amenities: prev.Amenities.includes(amenity)
        ? prev.Amenities.filter(a => a !== amenity)
        : [...prev.Amenities, amenity]
    }));
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.Name.trim()) {
      setError('Hotel name is required');
      return;
    }
    if (!formData.Location.trim()) {
      setError('Location is required');
      return;
    }

    setLoading(true);
    try {
      // Use hotel._id for the API call - ensure it's defined
      const hotelId = hotel?._id || hotel?.id;
      
      if (!hotelId) {
        setError('Hotel ID is missing. Please refresh and try again.');
        setLoading(false);
        return;
      }
      
      console.log('Updating hotel with ID:', hotelId);
      console.log('API URL:', `${API_URL}/hotels/${hotelId}`);
      
      const response = await fetch(`${API_URL}/hotels/${hotelId}`, {
        method: 'PUT',
        ...getAuthHeader(),
        body: JSON.stringify({
          Name: formData.Name,
          Location: formData.Location,
          Rating: formData.Rating,
          Amenities: formData.Amenities,
          Image: formData.Image,
        }),
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Hotel updated successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess(data.data);
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'Failed to update hotel');
      }
    } catch (err) {
      console.error('Error updating hotel:', err);
      setError(err.message || 'Failed to update hotel. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <FaEdit /> Edit Hotel
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}

              {/* Hotel Name */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <FaBuilding className="me-2" />Hotel Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  placeholder="Enter hotel name"
                  required
                />
              </div>

              {/* Location */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <FaMapMarkerAlt className="me-2" />Location
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="Location"
                  value={formData.Location}
                  onChange={handleChange}
                  placeholder="Enter hotel location"
                  required
                />
              </div>

              {/* Rating */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <FaStar className="me-2" />Rating
                </label>
                <select
                  className="form-select"
                  name="Rating"
                  value={formData.Rating}
                  onChange={handleChange}
                >
                  {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(rating => (
                    <option key={rating} value={rating}>
                      {rating} Star{rating !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image URL */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <FaImage className="me-2" />Image URL
                </label>
                <input
                  type="url"
                  className="form-control"
                  name="Image"
                  value={formData.Image}
                  onChange={handleChange}
                  placeholder="https://example.com/hotel-image.jpg"
                />
                {formData.Image && (
                  <div className="mt-2">
                    <img 
                      src={formData.Image} 
                      alt="Hotel preview" 
                      className="img-fluid rounded"
                      style={{ maxHeight: '150px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="mb-3">
                <label className="form-label fw-bold">Amenities</label>
                <div className="d-flex flex-wrap gap-2">
                  {availableAmenities.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      className={`btn btn-sm ${
                        formData.Amenities.includes(amenity)
                          ? 'btn-primary'
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => handleAmenityToggle(amenity)}
                    >
                      {formData.Amenities.includes(amenity) && (
                        <FaStar className="me-1" style={{ fontSize: '0.6rem' }} />
                      )}
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                <FaTimes className="me-1" /> Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaEdit className="me-1" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditHotelModal;

