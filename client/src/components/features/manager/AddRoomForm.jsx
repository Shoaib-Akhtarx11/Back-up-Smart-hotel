import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FaTimes, FaHotel, FaMoneyBillWave, FaUserFriends, FaCheckCircle } from 'react-icons/fa';
import { addManagerRoom } from '../../../redux/managerSlice';

const AddRoomForm = ({ hotels = [], onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        HotelID: '',
        Type: '',
        Price: '',
        Capacity: 2,
        Amenities: [],
        Image: '',
        Availability: true
    });
    const [errors, setErrors] = useState({});

    const roomTypes = ['Standard Room', 'Deluxe Room', 'Suite', 'Premium Room', 'Family Room', 'Double Room', 'Twin Room', 'Single Room'];
    const amenityOptions = ['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Safe', 'Room Service', 'Balcony', 'Sea View', 'City View', 'King Bed', 'Twin Beds', 'Work Desk'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAmenityToggle = (amenity) => {
        setFormData(prev => ({
            ...prev,
            Amenities: prev.Amenities.includes(amenity)
                ? prev.Amenities.filter(a => a !== amenity)
                : [...prev.Amenities, amenity]
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.HotelID) {
            newErrors.HotelID = 'Please select a hotel';
        }
        if (!formData.Type.trim()) {
            newErrors.Type = 'Room type is required';
        }
        if (!formData.Price || parseFloat(formData.Price) <= 0) {
            newErrors.Price = 'Price must be greater than 0';
        }
        if (!formData.Capacity || parseInt(formData.Capacity) < 1) {
            newErrors.Capacity = 'Capacity must be at least 1';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        
        try {
            const roomData = {
                HotelID: formData.HotelID,
                Type: formData.Type,
                Price: parseFloat(formData.Price),
                Capacity: parseInt(formData.Capacity),
                Amenities: formData.Amenities,
                Image: formData.Image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500',
                Availability: formData.Availability
            };

            await dispatch(addManagerRoom(roomData)).unwrap();
            alert('Room added successfully!');
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error adding room:', error);
            alert(error.message || 'Failed to add room. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal d-flex align-items-center justify-content-center" 
             style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4" style={{ maxHeight: '90vh', overflow: 'auto' }}>
                    <div className="modal-header border-0 pb-0">
                        <h4 className="modal-title fw-bold">Add New Room</h4>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>
                    
                    <div className="modal-body">
                        {hotels.length === 0 ? (
                            <div className="alert alert-warning">
                                <strong>No hotels found!</strong> Please add a hotel first before adding rooms.
                                <div className="mt-2">
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => { onClose(); window.location.href = '/add-hotel'; }}
                                    >
                                        Add Hotel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {/* Hotel Selection */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        <FaHotel className="me-2" />Select Hotel *
                                    </label>
                                    <select
                                        name="HotelID"
                                        value={formData.HotelID}
                                        onChange={handleInputChange}
                                        className={`form-control ${errors.HotelID ? 'is-invalid' : ''}`}
                                    >
                                        <option value="">-- Choose Your Hotel --</option>
                                        {hotels.map(hotel => (
                                            <option key={hotel._id} value={hotel._id}>
                                                {hotel.Name} - {hotel.Location}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.HotelID && <div className="invalid-feedback">{errors.HotelID}</div>}
                                </div>

                                {/* Room Type */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Room Type *</label>
                                    <select
                                        name="Type"
                                        value={formData.Type}
                                        onChange={handleInputChange}
                                        className={`form-control ${errors.Type ? 'is-invalid' : ''}`}
                                    >
                                        <option value="">-- Select Room Type --</option>
                                        {roomTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.Type && <div className="invalid-feedback">{errors.Type}</div>}
                                </div>

                                {/* Price and Capacity */}
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">
                                            <FaMoneyBillWave className="me-2" />Price (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            name="Price"
                                            value={formData.Price}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.Price ? 'is-invalid' : ''}`}
                                            placeholder="Enter price per night"
                                            min="1"
                                        />
                                        {errors.Price && <div className="invalid-feedback">{errors.Price}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">
                                            <FaUserFriends className="me-2" />Capacity *
                                        </label>
                                        <input
                                            type="number"
                                            name="Capacity"
                                            value={formData.Capacity}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.Capacity ? 'is-invalid' : ''}`}
                                            placeholder="Number of guests"
                                            min="1"
                                            max="10"
                                        />
                                        {errors.Capacity && <div className="invalid-feedback">{errors.Capacity}</div>}
                                    </div>
                                </div>

                                {/* Room Image URL */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Room Image URL</label>
                                    <input
                                        type="url"
                                        name="Image"
                                        value={formData.Image}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        placeholder="https://example.com/room-image.jpg"
                                    />
                                    {formData.Image && (
                                        <div className="mt-2">
                                            <img 
                                                src={formData.Image} 
                                                alt="Room Preview" 
                                                className="img-thumbnail"
                                                style={{ maxWidth: '200px', maxHeight: '150px' }}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Availability */}
                                <div className="mb-3">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="Availability"
                                            checked={formData.Availability}
                                            onChange={(e) => setFormData(prev => ({ ...prev, Availability: e.target.checked }))}
                                        />
                                        <label className="form-check-label" htmlFor="Availability">
                                            <FaCheckCircle className="me-1" /> Room is available for booking
                                        </label>
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Amenities</label>
                                    <div className="row g-2">
                                        {amenityOptions.map(amenity => (
                                            <div key={amenity} className="col-md-4 col-6">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`amenity-${amenity}`}
                                                        checked={formData.Amenities.includes(amenity)}
                                                        onChange={() => handleAmenityToggle(amenity)}
                                                    />
                                                    <label className="form-check-label small" htmlFor={`amenity-${amenity}`}>
                                                        {amenity}
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="d-flex gap-2 justify-content-end mt-4">
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Adding...
                                            </>
                                        ) : (
                                            'Add Room'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddRoomForm;

