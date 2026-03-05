import React, { useState } from 'react';
import { FaHotel, FaMapMarkerAlt, FaImage, FaList } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5600/api';

const AddHotelForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    Name: '',
    Location: '',
    Image: '',
    Amenities: [],
    Rating: 0,
  });

  const [amenityInput, setAmenityInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableAmenities = [
    'Free WiFi', 'Pool', 'Breakfast included', 'Spa', 'Fitness Center',
    'Restaurant', 'Room Service', 'Parking', 'Airport Shuttle',
    'Business Center', 'Laundry', 'Concierge', 'Bar/Lounge',
    'Beach Access', 'Sea View', 'City View', 'Mountain View',
    'Pet Friendly', 'Wheelchair Accessible', 'Air Conditioning'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      Amenities: prev.Amenities.includes(amenity)
        ? prev.Amenities.filter(a => a !== amenity)
        : [...prev.Amenities, amenity]
    }));
  };

  const handleAddCustomAmenity = () => {
    if (amenityInput.trim() && !formData.Amenities.includes(amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        Amenities: [...prev.Amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
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
      // Don't send ManagerID - backend gets it from auth middleware
      const response = await fetch(`${API_URL}/hotels`, {
        method: 'POST',
        ...getAuthHeader(),
        body: JSON.stringify({
          Name: formData.Name,
          Location: formData.Location,
          Image: formData.Image,
          Amenities: formData.Amenities,
          Rating: parseFloat(formData.Rating) || 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (onSuccess) onSuccess(data.data);
        alert('Hotel added successfully!');
      } else {
        setError(data.message || 'Failed to add hotel');
      }
    } catch (err) {
      console.error('Error adding hotel:', err);
      setError(err.message || 'Failed to add hotel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="card border-0 shadow-sm">
    <div className="card-header bg-white py-3">
      <h5 className="mb-0 fw-bold">
        <FaHotel className="me-2" />
        Add New Hotel
      </h5>
    </div>
    <div className="card-body">
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-bold">
            Hotel Name <span className="text-danger">*</span>
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

        <div className="mb-3">
          <label className="form-label fw-bold">
            Location <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text"><FaMapMarkerAlt /></span>
            <input
              type="text"
              className="form-control"
              name="Location"
              value={formData.Location}
              onChange={handleChange}
              placeholder="Enter city or location"
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Hotel Image URL</label>
          <div className="input-group">
            <span className="input-group-text"><FaImage /></span>
            <input
              type="url"
              className="form-control"
              name="Image"
              value={formData.Image}
              onChange={handleChange}
              placeholder="https://example.com/hotel-image.jpg"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">
            <FaList className="me-1" /> Amenities
          </label>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {availableAmenities.map(amenity => (
              <button
                key={amenity}
                type="button"
                className={`btn btn-sm ${formData.Amenities.includes(amenity) ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => handleAmenityToggle(amenity)}
              >
                {amenity}
              </button>
            ))}
          </div>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Enter custom amenity"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddCustomAmenity}
            >
              Add
            </button>
          </div>
          {formData.Amenities.length > 0 && (
            <div className="mt-2 d-flex flex-wrap gap-2">
              {formData.Amenities.map(amenity => (
                <span key={amenity} className="badge bg-primary">
                  {amenity}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-2"
                    style={{ fontSize: '0.5rem' }}
                    onClick={() => handleAmenityToggle(amenity)}
                  />
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="d-flex gap-2 justify-content-end mt-4">
          {onCancel && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Hotel'}
          </button>
        </div>
      </form>
    </div>
  </div>
);
};

      export default AddHotelForm;
