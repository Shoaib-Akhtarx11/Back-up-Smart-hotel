import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { addHotel, updateHotel } from '../redux/hotelSlice';
import NavBar from '../components/layout/NavBar';
import Footer from '../components/layout/Footer';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import { generateNewManager, autoAssignManager, countManagerHotels } from '../utils/managerGenerator';

const AddHotel = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    
    // Get current user and all users from auth state
    const auth = useSelector((state) => state.auth);
    const reduxUsers = useSelector((state) => state.users?.allUsers || []);
    const currentManager = auth.user;
    const isManager = auth.role === 'manager';
    const isAdmin = auth.role === 'admin';
    
    // Get managers list for admin
    const getManagers = () => {
        const storedUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        const managers = storedUsers.filter(u => u.role === 'manager');
        return managers.length > 0 ? managers : reduxUsers.filter(u => u.role === 'manager');
    };
    
    const managers = getManagers();
    
    // Check if editing
    const editHotel = location.state?.editHotel;
    const isEditing = location.state?.isEditing || false;
    
    // Form state
    const [formData, setFormData] = useState({
        name: editHotel?.name || '',
        location: editHotel?.location || '',
        rating: editHotel?.rating || 5.0,
        reviewsCount: editHotel?.reviewsCount || 0,
        tag: editHotel?.tag || 'New',
        image: editHotel?.image || '',
        offer: editHotel?.offer || 'Welcome Offer',
        features: editHotel?.features || [],
        amenities: editHotel?.amenities || [],
        managerId: editHotel?.managerId || (isAdmin ? '' : currentManager?.id)
    });
    
    const [selectedFeatures, setSelectedFeatures] = useState(editHotel?.features || []);
    const [selectedAmenities, setSelectedAmenities] = useState(editHotel?.amenities || []);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    
    const availableFeatures = ['Sea View', 'City View', 'Garden View', 'Mountain View', 'Travel Desk', 'Lake View', 'Heritage Building', 'Nightlife Access', 'Luxury Spa', 'Club Access'];
    const availableAmenities = ['Free WiFi', 'Pool', 'Breakfast included', 'Gym', 'Spa', 'Restaurant', 'Free cancellation', 'Concierge', 'Business Center', 'Fitness Center'];
    
    // Check if user is authenticated and is a manager or admin
    useEffect(() => {
        if (auth.role !== 'manager' && auth.role !== 'admin') {
            navigate('/');
        }
    }, [auth.role, navigate]);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    
    const handleFeatureToggle = (feature) => {
        setSelectedFeatures(prev => 
            prev.includes(feature) 
                ? prev.filter(f => f !== feature)
                : [...prev, feature]
        );
    };
    
    const handleAmenityToggle = (amenity) => {
        setSelectedAmenities(prev => 
            prev.includes(amenity) 
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Hotel name is required';
        }
        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        }
        if (!formData.image.trim()) {
            newErrors.image = 'Hotel image URL is required';
        }
        if (formData.rating < 1 || formData.rating > 10) {
            newErrors.rating = 'Rating must be between 1 and 10';
        }
        if (selectedFeatures.length === 0) {
            newErrors.features = 'Select at least one feature';
        }
        if (selectedAmenities.length === 0) {
            newErrors.amenities = 'Select at least one amenity';
        }
        if (isAdmin && !formData.managerId) {
            newErrors.managerId = 'Please select a manager for the hotel';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            if (isEditing) {
                // Update existing hotel
                const updatedHotel = {
                    id: editHotel.id,
                    managerId: editHotel.managerId, // Keep original manager
                    name: formData.name,
                    location: formData.location,
                    rating: parseFloat(formData.rating),
                    reviewsCount: formData.reviewsCount,
                    tag: formData.tag,
                    image: formData.image,
                    offer: formData.offer,
                    features: selectedFeatures,
                    amenities: selectedAmenities
                };
                
                dispatch(updateHotel(updatedHotel));
                
                // Update localStorage
                const allHotels = JSON.parse(localStorage.getItem('allHotels') || '[]');
                const index = allHotels.findIndex(h => h.id === editHotel.id);
                if (index >= 0) {
                    allHotels[index] = updatedHotel;
                }
                localStorage.setItem('allHotels', JSON.stringify(allHotels));
                
                alert(`${formData.name} is updated`);
            } else {
                // Add new hotel - Auto-assign manager if admin didn't select one
                let assignedManagerId = formData.managerId;
                
                if (isAdmin && !assignedManagerId) {
                    // Auto-assign based on load balancing
                    assignedManagerId = autoAssignManager();
                } else if (!isAdmin) {
                    // Manager is adding hotel, use their own ID
                    assignedManagerId = currentManager?.id;
                }
                
                const newHotel = {
                    id: `h${Date.now()}`,
                    name: formData.name,
                    location: formData.location,
                    managerId: assignedManagerId,
                    rating: parseFloat(formData.rating),
                    reviewsCount: 0,
                    tag: formData.tag,
                    image: formData.image,
                    offer: formData.offer,
                    features: selectedFeatures,
                    amenities: selectedAmenities
                };
                
                dispatch(addHotel(newHotel));
                
                // Save to localStorage
                const allHotels = JSON.parse(localStorage.getItem('allHotels') || '[]');
                allHotels.push(newHotel);
                localStorage.setItem('allHotels', JSON.stringify(allHotels));
                
                // Get manager name for confirmation
                const storedUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
                const assignedManager = storedUsers.find(u => u.id == assignedManagerId);
                const managerName = assignedManager?.name || 'New Manager';
                
                alert(`${formData.name} is created and assigned to ${managerName}`);
            }
            
            // Reset form
            setFormData({
                name: '',
                location: '',
                rating: 5.0,
                reviewsCount: 0,
                tag: 'New',
                image: '',
                offer: 'Welcome Offer',
                features: [],
                amenities: [],
                managerId: isAdmin ? '' : currentManager?.id
            });
            setSelectedFeatures([]);
            setSelectedAmenities([]);
            
            // Redirect based on user role
            setTimeout(() => {
                if (isAdmin) {
                    navigate('/admin', { state: { activeTab: 'hotels' } });
                } else {
                    navigate('/manager');
                }
            }, 1500);
        } catch (error) {
            console.error('Error saving hotel:', error);
            setErrors({ submit: 'Failed to save hotel. Please try again.' });
        }
    };
    
    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar />
            
            <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa', paddingTop: '40px', paddingBottom: '40px' }}>
                <div className="container">
                    {/* Header */}
                    <div className="mb-4">
                        <button 
                            onClick={() => isAdmin ? navigate('/admin') : navigate('/manager')}
                            className="btn btn-outline-secondary rounded-pill mb-3 d-flex align-items-center gap-2"
                        >
                            <FaArrowLeft /> Back to Dashboard
                        </button>
                        <h2 className="fw-bold">{isEditing ? '✏️ Edit Hotel Property' : '➕ Add New Hotel Property'}</h2>
                        <p className="text-muted">{isEditing ? 'Update the details of your property' : 'Fill in the details below to list your property'}</p>
                    </div>
                    
                    {/* Success Message */}
                    {successMessage && (
                        <div className="alert alert-success border-0 rounded-4 mb-4" role="alert">
                            <strong>Success!</strong> {successMessage}
                        </div>
                    )}
                    
                    {/* Error Message */}
                    {errors.submit && (
                        <div className="alert alert-danger border-0 rounded-4 mb-4" role="alert">
                            {errors.submit}
                        </div>
                    )}
                    
                    {/* Form */}
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {/* Basic Information */}
                                <h5 className="fw-bold mb-3">Basic Information</h5>
                                
                                <div className="row mb-4 g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small">Hotel Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`form-control rounded-3 ${errors.name ? 'is-invalid' : ''}`}
                                            placeholder="Enter hotel name"
                                        />
                                        {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small">Location *</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className={`form-control rounded-3 ${errors.location ? 'is-invalid' : ''}`}
                                            placeholder="e.g., Mumbai, Goa, Jaipur"
                                        />
                                        {errors.location && <div className="invalid-feedback d-block">{errors.location}</div>}
                                    </div>
                                </div>
                                
                                <div className="row mb-4 g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small">Initial Rating (1-10) *</label>
                                        <input
                                            type="number"
                                            name="rating"
                                            value={formData.rating}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="10"
                                            step="0.1"
                                            className={`form-control rounded-3 ${errors.rating ? 'is-invalid' : ''}`}
                                        />
                                        {errors.rating && <div className="invalid-feedback d-block">{errors.rating}</div>}
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small">Tag</label>
                                        <input
                                            type="text"
                                            name="tag"
                                            value={formData.tag}
                                            onChange={handleInputChange}
                                            className="form-control rounded-3"
                                            placeholder="e.g., New, Recommended, Featured"
                                        />
                                    </div>
                                </div>

                                {/* Manager Selection for Admin */}
                                {isAdmin && (
                                    <div className="row mb-4 g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small">Assign Manager *</label>
                                            <select
                                                name="managerId"
                                                value={formData.managerId}
                                                onChange={handleInputChange}
                                                className={`form-control rounded-3 ${errors.managerId ? 'is-invalid' : ''}`}
                                            >
                                                <option value="">-- Select a Manager --</option>
                                                {managers.map(manager => (
                                                    <option key={manager.id} value={manager.id}>
                                                        {manager.name} ({manager.email})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.managerId && <div className="invalid-feedback d-block">{errors.managerId}</div>}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Image and Offer */}
                                <div className="row mb-4 g-3">
                                    <div className="col-12">
                                        <label className="form-label fw-bold small">Hotel Image URL *</label>
                                        <input
                                            type="url"
                                            name="image"
                                            value={formData.image}
                                            onChange={handleInputChange}
                                            className={`form-control rounded-3 ${errors.image ? 'is-invalid' : ''}`}
                                            placeholder="https://example.com/hotel-image.jpg"
                                        />
                                        {errors.image && <div className="invalid-feedback d-block">{errors.image}</div>}
                                        {formData.image && (
                                            <div className="mt-3">
                                                <img 
                                                    src={formData.image} 
                                                    alt="Preview" 
                                                    className="img-thumbnail rounded-3"
                                                    style={{ maxWidth: '300px', maxHeight: '200px' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="row mb-4 g-3">
                                    <div className="col-12">
                                        <label className="form-label fw-bold small">Current Offer</label>
                                        <input
                                            type="text"
                                            name="offer"
                                            value={formData.offer}
                                            onChange={handleInputChange}
                                            className="form-control rounded-3"
                                            placeholder="e.g., 15% OFF for Credit Cards"
                                        />
                                    </div>
                                </div>
                                
                                <hr />
                                
                                {/* Features */}
                                <h5 className="fw-bold mb-3">Features *</h5>
                                <div className="row mb-4 g-2">
                                    {availableFeatures.map(feature => (
                                        <div key={feature} className="col-md-6 col-lg-4">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`feature-${feature}`}
                                                    checked={selectedFeatures.includes(feature)}
                                                    onChange={() => handleFeatureToggle(feature)}
                                                />
                                                <label className="form-check-label" htmlFor={`feature-${feature}`}>
                                                    {feature}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {errors.features && <div className="text-danger small mb-4">{errors.features}</div>}
                                
                                <hr />
                                
                                {/* Amenities */}
                                <h5 className="fw-bold mb-3">Amenities *</h5>
                                <div className="row mb-4 g-2">
                                    {availableAmenities.map(amenity => (
                                        <div key={amenity} className="col-md-6 col-lg-4">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`amenity-${amenity}`}
                                                    checked={selectedAmenities.includes(amenity)}
                                                    onChange={() => handleAmenityToggle(amenity)}
                                                />
                                                <label className="form-check-label" htmlFor={`amenity-${amenity}`}>
                                                    {amenity}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {errors.amenities && <div className="text-danger small mb-4">{errors.amenities}</div>}
                                
                                <hr />
                                
                                {/* Submit Button */}
                                <div className="d-flex gap-2 justify-content-end">
                                    <button 
                                        type="button"
                                        onClick={() => navigate('/manager')}
                                        className="btn btn-outline-secondary rounded-pill px-5"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="btn btn-primary rounded-pill px-5 d-flex align-items-center gap-2"
                                    >
                                        <FaPlus /> Add Hotel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default AddHotel;
