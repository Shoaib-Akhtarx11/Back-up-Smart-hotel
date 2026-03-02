import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../../redux/userSlice';

const EditUserModal = ({ user, show, onClose, type = 'customer' }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState(user || {});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            dispatch(updateUser({
                id: user.id,
                ...formData
            }));

            // Save to localStorage for persistence
            const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
            const index = allUsers.findIndex(u => u.id === user.id);
            if (index >= 0) {
                allUsers[index] = { id: user.id, ...formData };
            } else {
                allUsers.push({ id: user.id, ...formData });
            }
            localStorage.setItem('allUsers', JSON.stringify(allUsers));

            // Show success alert
            alert(`${formData.name} is updated`);
            
            setLoading(false);
            onClose();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user. Please try again.');
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                            Edit {type === 'manager' ? 'Manager' : 'Customer'}: {user?.name}
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white" 
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Full Name</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Email</label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Phone</label>
                                <input 
                                    type="tel" 
                                    className="form-control" 
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                />
                            </div>

                            {type === 'customer' && (
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Loyalty Points</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        name="loyaltyPoints"
                                        value={formData.loyaltyPoints || 0}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                            )}

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update ' + (type === 'manager' ? 'Manager' : 'Customer')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;
