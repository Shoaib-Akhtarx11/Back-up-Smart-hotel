import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateHotel } from '../../../redux/hotelSlice';

const HotelTable = ({ hotels, onDelete, onEdit, isManager = false }) => {
    const dispatch = useDispatch();
    const [editingHotelId, setEditingHotelId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    
    const hotelAmenities = ['Free WiFi', 'Pool', 'Breakfast included', 'Gym', 'Spa', 'Restaurant', 'Free cancellation', 'Concierge', 'Business Center', 'Fitness Center'];
    const hotelFeatures = ['Sea View', 'City View', 'Garden View', 'Mountain View', 'Travel Desk', 'Lake View', 'Heritage Building', 'Nightlife Access', 'Luxury Spa', 'Club Access'];

    const startEdit = (hotel) => {
        setEditingHotelId(hotel.id);
        setEditFormData({
            ...hotel,
            amenities: hotel.amenities || [],
            features: hotel.features || []
        });
    };

    const cancelEdit = () => {
        setEditingHotelId(null);
        setEditFormData({});
    };

    const handleEditChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAmenityToggle = (amenity) => {
        const amenities = editFormData.amenities || [];
        setEditFormData(prev => ({
            ...prev,
            amenities: amenities.includes(amenity)
                ? amenities.filter(a => a !== amenity)
                : [...amenities, amenity]
        }));
    };

    const handleFeatureToggle = (feature) => {
        const features = editFormData.features || [];
        setEditFormData(prev => ({
            ...prev,
            features: features.includes(feature)
                ? features.filter(f => f !== feature)
                : [...features, feature]
        }));
    };

    const saveEdit = (hotelId) => {
        try {
            dispatch(updateHotel(editFormData));
            
            // Update localStorage
            const allHotels = JSON.parse(localStorage.getItem('allHotels') || '[]');
            const index = allHotels.findIndex(h => h.id === hotelId);
            if (index >= 0) {
                allHotels[index] = editFormData;
            }
            localStorage.setItem('allHotels', JSON.stringify(allHotels));
            
            alert(`${editFormData.name} is updated`);
            setEditingHotelId(null);
            setEditFormData({});
        } catch (error) {
            console.error('Error updating hotel:', error);
            alert('Failed to update hotel');
        }
    };

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th scope="col" className="ps-3">ID</th>
                        <th scope="col">Preview</th>
                        <th scope="col">Hotel Name</th>
                        <th scope="col">Location</th>
                        <th scope="col">Manager</th>
                        <th scope="col" className="text-end pe-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {hotels.length > 0 ? (
                        hotels.map((hotel) => (
                            editingHotelId === hotel.id ? (
                                // Edit Mode
                                <tr key={hotel.id} className="bg-light">
                                    <td colSpan="6" className="p-4">
                                        <div className="card border-2 border-primary">
                                            <div className="card-body">
                                                <h5 className="card-title mb-3">Edit: {hotel.name}</h5>
                                                
                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-bold small">Hotel Name</label>
                                                        <input 
                                                            type="text" 
                                                            className="form-control form-control-sm" 
                                                            value={editFormData.name}
                                                            onChange={(e) => handleEditChange('name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-bold small">Location</label>
                                                        <input 
                                                            type="text" 
                                                            className="form-control form-control-sm" 
                                                            value={editFormData.location}
                                                            onChange={(e) => handleEditChange('location', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row mb-3">
                                                    <div className="col-md-3">
                                                        <label className="form-label fw-bold small">Rating</label>
                                                        <input 
                                                            type="number" 
                                                            className="form-control form-control-sm" 
                                                            min="1" 
                                                            max="10" 
                                                            step="0.1"
                                                            value={editFormData.rating}
                                                            onChange={(e) => handleEditChange('rating', parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label fw-bold small">Tag</label>
                                                        <input 
                                                            type="text" 
                                                            className="form-control form-control-sm" 
                                                            value={editFormData.tag}
                                                            onChange={(e) => handleEditChange('tag', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label fw-bold small">Offer</label>
                                                        <input 
                                                            type="text" 
                                                            className="form-control form-control-sm" 
                                                            value={editFormData.offer}
                                                            onChange={(e) => handleEditChange('offer', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label fw-bold small">Amenities</label>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {hotelAmenities.map(amenity => (
                                                            <div key={amenity} className="form-check">
                                                                <input 
                                                                    className="form-check-input" 
                                                                    type="checkbox" 
                                                                    id={`amenity-${amenity}`}
                                                                    checked={(editFormData.amenities || []).includes(amenity)}
                                                                    onChange={() => handleAmenityToggle(amenity)}
                                                                />
                                                                <label className="form-check-label small" htmlFor={`amenity-${amenity}`}>
                                                                    {amenity}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label fw-bold small">Features</label>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {hotelFeatures.map(feature => (
                                                            <div key={feature} className="form-check">
                                                                <input 
                                                                    className="form-check-input" 
                                                                    type="checkbox" 
                                                                    id={`feature-${feature}`}
                                                                    checked={(editFormData.features || []).includes(feature)}
                                                                    onChange={() => handleFeatureToggle(feature)}
                                                                />
                                                                <label className="form-check-label small" htmlFor={`feature-${feature}`}>
                                                                    {feature}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="d-flex gap-2 justify-content-end">
                                                    <button 
                                                        className="btn btn-sm btn-secondary" 
                                                        onClick={cancelEdit}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-success" 
                                                        onClick={() => saveEdit(hotel.id)}
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                // Normal View
                                <tr key={hotel.id}>
                                    <td className="ps-3 text-muted">#{hotel.id}</td>
                                    <td>
                                        <img 
                                            src={hotel.image} 
                                            alt={hotel.name} 
                                            width="60" 
                                            height="40" 
                                            className="rounded shadow-sm" 
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </td>
                                    <td>
                                        <div className="fw-bold text-dark">{hotel.name}</div>
                                        <div className="small text-muted">{hotel.tag || 'Standard'}</div>
                                    </td>
                                    <td>
                                        <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                                            📍 {hotel.location}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge bg-info text-white">
                                            Manager ID: {hotel.managerId}
                                        </span>
                                    </td>
                                    <td className="text-end pe-3">
                                        <div className="btn-group">
                                            <button 
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => startEdit(hotel)}
                                                title="Edit hotel details"
                                            >
                                                <i className="bi bi-pencil-square me-1"></i>Edit
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-danger" 
                                                onClick={() => {
                                                    if(window.confirm(`Are you sure you want to delete ${hotel.name}?`)) {
                                                        onDelete(hotel.id);
                                                    }
                                                }}
                                                title="Delete hotel"
                                            >
                                                <i className="bi bi-trash me-1"></i>Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center py-5 text-muted">
                                <i className="bi bi-building-x fs-2 d-block mb-2"></i>
                                No hotels listed in the directory.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default HotelTable;