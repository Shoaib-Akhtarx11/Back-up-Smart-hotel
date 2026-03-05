import React, { useState } from 'react';
import { FaBed, FaDollarSign, FaImage, FaList } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5600/api';

const AddRoomForm = ({ hotels, onSuccess, onCancel, editRoom }) => {
  const [formData, setFormData] = useState({
    Type: editRoom?.Type || 'Standard Room',
    Price: editRoom?.Price || '',
    HotelID: editRoom?.HotelID?._id || editRoom?.HotelID || (hotels[0]?._id || hotels[0]?.id) || '',
    Availability: editRoom?.Availability !== undefined ? editRoom.Availability : true,
    Features: editRoom?.Features || [],
    Image: editRoom?.Image || '',
    NumberOfRooms: editRoom?.NumberOfRooms || 1,
  });
  
  const [amenityInput, setAmenityInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roomTypes = [
    'Standard Room', 'Deluxe Room', 'Suite', 'Premium Suite', 'Executive Room',
    'Family Room', 'Twin Room', 'Double Room', 'Single Room', 'Penthouse'
  ];

  const availableFeatures = [
    'Free WiFi', 'TV', 'Air Conditioning', 'Heating', 'Breakfast included',
    'Mini Bar', 'Coffee Maker', 'Safe', 'Workspace', 'Ocean View', 'City View',
    'Garden View', 'Balcony', 'Bathtub', 'King Bed', 'Spa Access', 'Gym Access'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'Price' || name === 'NumberOfRooms' ? parseInt(value) || 0 : value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      Features: prev.Features.includes(feature)
        ? prev.Features.filter(f => f !== feature)
        : [...prev.Features, feature]
    }));
  };

  const handleAddCustomFeature = () => {
    if (amenityInput.trim() && !formData.Features.includes(amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        Features: [...prev.Features, amenityInput.trim()]
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

    if (!formData.Type.trim()) {
      setError('Room type is required');
      return;
    }
    if (!formData.Price || formData.Price <= 0) {
      setError('Please enter a valid price');
      return;
    }
    if (!formData.HotelID) {
      setError('Please select a hotel');
      return;
    }

    setLoading(true);
    try {
      const url = editRoom 
        ? `${API_URL}/rooms/${editRoom._id || editRoom.id}`
        : `${API_URL}/rooms`;
      
      const response = await fetch(url, {
        method: editRoom ? 'PUT' : 'POST',
        ...getAuthHeader(),
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        const storedRooms = JSON.parse(localStorage.getItem('allRooms') || '[]');
        const newRoom = { ...data.data, id: data.data._id, hotelId: formData.HotelID };
        
        if (editRoom) {
          const updatedRooms = storedRooms.map(r => 
            (r._id || r.id) === (editRoom._id || editRoom.id) ? newRoom : r
          );
          localStorage.setItem('allRooms', JSON.stringify(updatedRooms));
        } else {
          localStorage.setItem('allRooms', JSON.stringify([...storedRooms, newRoom]));
        }
        
        if (onSuccess) onSuccess(data.data);
        alert(editRoom ? 'Room updated successfully!' : 'Room added successfully!');
      }
    } catch (err) {
      console.error('Error saving room:', err);
      setError(err.message || 'Failed to save room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="card border-0 shadow-sm">
    <div className="card-header bg-white py-3">
      <h5 className="mb-0 fw-bold">
        <FaBed className="me-2" />
        {editRoom ? 'Edit Room' : 'Add New Room'}
      </h5>
    </div>
    <div className="card-body">
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-bold">
            Select Hotel <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            name="HotelID"
            value={formData.HotelID}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Hotel --</option>
            {hotels.map(hotel => (
              <option key={hotel._id || hotel.id} value={hotel._id || hotel.id}>
                {hotel.Name} - {hotel.Location}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">
            Room Type <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            name="Type"
            value={formData.Type}
            onChange={handleChange}
            required
          >
            {roomTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">
            Price per Night (₹) <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text"><FaDollarSign /></span>
            <input
              type="number"
              className="form-control"
              name="Price"
              value={formData.Price}
              onChange={handleChange}
              placeholder="Enter price"
              min="0"
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Number of Rooms</label>
          <input
            type="number"
            className="form-control"
            name="NumberOfRooms"
            value={formData.NumberOfRooms}
            onChange={handleChange}
            min="1"
          />
        </div>

        <div className="mb-3">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              name="Availability"
              id="Availability"
              checked={formData.Availability}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="Availability">
              Room Available for Booking
            </label>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Room Image URL</label>
          <div className="input-group">
            <span className="input-group-text"><FaImage /></span>
            <input
              type="url"
              className="form-control"
              name="Image"
              value={formData.Image}
              onChange={handleChange}
              placeholder="https://example.com/room-image.jpg"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">
            <FaList className="me-1" /> Room Features
          </label>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {availableFeatures.map(feature => (
              <button
                key={feature}
                type="button"
                className={`btn btn-sm ${formData.Features.includes(feature) ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => handleFeatureToggle(feature)}
              >
                {feature}
              </button>
            ))}
          </div>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Enter custom feature"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddCustomFeature}
            >
              Add
            </button>
          </div>
          {formData.Features.length > 0 && (
            <div className="mt-2 d-flex flex-wrap gap-2">
              {formData.Features.map(feature => (
                <span key={feature} className="badge bg-primary">
                  {feature}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-2"
                    style={{ fontSize: '0.5rem' }}
                    onClick={() => handleFeatureToggle(feature)}
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
            {loading ? 'Saving...' : editRoom ? 'Update Room' : 'Add Room'}
          </button>
        </div>
      </form>
    </div>
  </div>
);
};

export default AddRoomForm;
