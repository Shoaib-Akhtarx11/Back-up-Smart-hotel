import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BookingForm = ({ hotel, room, initialEmail, onSubmit }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
    const [guestDetails, setGuestDetails] = useState({
        firstName: '',
        lastName: '',
        email: initialEmail || '',
        phone: ''
    });
    const [errors, setErrors] = useState({});
    const timerRef = useRef(null);

    const calculateNights = () => {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validate guest details
        if (!guestDetails.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!guestDetails.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!guestDetails.email.trim()) newErrors.email = 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestDetails.email)) newErrors.email = 'Invalid email format';
        if (!guestDetails.phone.trim()) newErrors.phone = 'Phone is required';
        if (!/^\d{10,}$/.test(guestDetails.phone.replace(/[-\s]/g, ''))) newErrors.phone = 'Phone must be at least 10 digits';
        
        // Validate dates
        if (startDate >= endDate) {
            newErrors.dates = 'Check-out date must be after check-in date';
        }
        
        if (startDate <= new Date()+1) {
            newErrors.startDate = 'Check-in date cannot be in the past';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nights = calculateNights();

    // LIVE UPDATE EFFECT: Updates the sidebar but does NOT open the modal
    // Use refs to avoid circular dependency - only depend on primitive values
    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        
        timerRef.current = setTimeout(() => {
            onSubmit({
                ...guestDetails,
                checkIn: startDate,
                checkOut: endDate,
                nights: nights,
                isDraft: true // Key: Tells parent NOT to show the modal
            });
        }, 500);
        
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [startDate, endDate, guestDetails, onSubmit]);

    // FINAL SUBMIT: Triggered ONLY by the button click
    const handleFinalSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        onSubmit({
            ...guestDetails,
            checkIn: startDate,
            checkOut: endDate,
            nights: nights,
            isDraft: false // Key: Tells parent TO show the modal
        });
    };

    return (
        <form onSubmit={handleFinalSubmit} className="border-0 p-2">
            {/* Validation Errors Alert */}
            {Object.keys(errors).length > 0 && (
                <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                    <strong>Please fix the following errors:</strong>
                    <ul className="mb-0 mt-2">
                        {Object.values(errors).map((error, idx) => (
                            <li key={idx}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">First Name *</label>
                    <input 
                        type="text" 
                        className={`form-control rounded-3 ${errors.firstName ? 'is-invalid' : ''}`}
                        required 
                        value={guestDetails.firstName}
                        onChange={(e) => {
                            setGuestDetails({ ...guestDetails, firstName: e.target.value });
                            if (errors.firstName) setErrors({ ...errors, firstName: '' });
                        }} 
                    />
                    {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName}</div>}
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Last Name *</label>
                    <input 
                        type="text" 
                        className={`form-control rounded-3 ${errors.lastName ? 'is-invalid' : ''}`}
                        required 
                        value={guestDetails.lastName}
                        onChange={(e) => {
                            setGuestDetails({ ...guestDetails, lastName: e.target.value });
                            if (errors.lastName) setErrors({ ...errors, lastName: '' });
                        }} 
                    />
                    {errors.lastName && <div className="invalid-feedback d-block">{errors.lastName}</div>}
                </div>
                <div className="col-md-12">
                    <label className="form-label small fw-bold text-muted">Email Address *</label>
                    <input 
                        type="email" 
                        className={`form-control rounded-3 ${errors.email ? 'is-invalid' : ''}`}
                        required 
                        value={guestDetails.email}
                        onChange={(e) => {
                            setGuestDetails({ ...guestDetails, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: '' });
                        }} 
                    />
                    {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                </div>
                <div className="col-md-12">
                    <label className="form-label small fw-bold text-muted">Phone Number *</label>
                    <input 
                        type="tel" 
                        className={`form-control rounded-3 ${errors.phone ? 'is-invalid' : ''}`}
                        required 
                        value={guestDetails.phone}
                        onChange={(e) => {
                            setGuestDetails({ ...guestDetails, phone: e.target.value });
                            if (errors.phone) setErrors({ ...errors, phone: '' });
                        }} 
                    />
                    {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
                </div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Check-in *</label>
                    <DatePicker 
                        selected={startDate} 
                        className={`form-control w-100 rounded-3 ${errors.startDate || errors.dates ? 'is-invalid' : ''}`}
                        minDate={new Date()}
                        onChange={(date) => { 
                            setStartDate(date); 
                            if (date >= endDate) setEndDate(new Date(date.getTime() + 86400000));
                            if (errors.startDate || errors.dates) setErrors({ ...errors, startDate: '', dates: '' });
                        }} 
                    />
                    {(errors.startDate || errors.dates) && <div className="invalid-feedback d-block">{errors.startDate || errors.dates}</div>}
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Check-out *</label>
                    <DatePicker 
                        selected={endDate} 
                        className={`form-control w-100 rounded-3 ${errors.dates ? 'is-invalid' : ''}`}
                        minDate={new Date(startDate.getTime() + 86400000)}
                        onChange={(date) => {
                            setEndDate(date);
                            if (errors.dates) setErrors({ ...errors, dates: '' });
                        }} 
                    />
                    {errors.dates && <div className="invalid-feedback d-block">{errors.dates}</div>}
                </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100 py-3 fw-bold rounded-pill">
                Continue to Payment <i className="bi bi-arrow-right ms-2"></i>
            </button>
        </form>
    );
};

export default BookingForm;