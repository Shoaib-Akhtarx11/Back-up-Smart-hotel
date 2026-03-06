import React, { useState } from 'react';
import { FaTrash, FaEdit, FaEye, FaUserTie } from 'react-icons/fa';

const HotelTable = ({ hotels, onDelete, isAdmin = false }) => {
    const [expandedHotel, setExpandedHotel] = useState(null);

    // Helper to get hotel data
    const getId = (hotel) => hotel._id || hotel.id || '';
    const getName = (hotel) => hotel.Name || hotel.name || '';
    const getLocation = (hotel) => hotel.Location || hotel.location || '';
    const getImage = (hotel) => hotel.Image || hotel.image || '';
    const getRating = (hotel) => hotel.Rating || hotel.rating || 0;
    const getManager = (hotel) => hotel.manager || hotel.ManagerID || null;

    const toggleExpand = (hotelId) => {
        setExpandedHotel(expandedHotel === hotelId ? null : hotelId);
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
                        {isAdmin && <th scope="col">Manager</th>}
                        <th scope="col">Rating</th>
                        {isAdmin && <th scope="col">Stats</th>}
                        <th scope="col" className="text-end pe-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {hotels.length > 0 ? (
                        hotels.map((hotel) => (
                            <React.Fragment key={getId(hotel)}>
                                <tr>
                                    <td className="ps-3 text-muted">#{getId(hotel).slice(-6)}</td>
                                    <td>
                                        <img 
                                            src={getImage(hotel)} 
                                            alt={getName(hotel)} 
                                            width="60" 
                                            height="40" 
                                            className="rounded shadow-sm" 
                                            style={{ objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <div className="fw-bold text-dark">{getName(hotel)}</div>
                                        <div className="small text-muted">
                                            {getRating(hotel) > 0 && (
                                                <span className="text-warning">
                                                    {"★".repeat(Math.round(getRating(hotel)))} {getRating(hotel).toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                                            📍 {getLocation(hotel)}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            {getManager(hotel) ? (
                                                <div className="d-flex align-items-center gap-2">
                                                    <FaUserTie className="text-warning" />
                                                    <div>
                                                        <div className="small fw-bold">
                                                            {getManager(hotel).Name || getManager(hotel).name || 'N/A'}
                                                        </div>
                                                        <div className="small text-muted">
                                                            {getManager(hotel).Email || getManager(hotel).email || ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="badge bg-secondary">Unassigned</span>
                                            )}
                                        </td>
                                    )}
                                    <td>
                                        <div className="d-flex align-items-center gap-1">
                                            <span className="text-warning">★</span>
                                            <span className="fw-bold">{getRating(hotel).toFixed(1)}</span>
                                        </div>
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            <div className="d-flex gap-2">
                                                <span className="badge bg-primary">
                                                    {hotel.roomCount || 0} rooms
                                                </span>
                                                <span className="badge bg-success">
                                                    {hotel.bookingCount || 0} bookings
                                                </span>
                                            </div>
                                        </td>
                                    )}
                                    <td className="text-end pe-3">
                                        <div className="btn-group">
                                            <button 
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => toggleExpand(getId(hotel))}
                                                title="View details"
                                            >
                                                <FaEye />
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-danger" 
                                                onClick={() => {
                                                    if(window.confirm(`Are you sure you want to delete ${getName(hotel)}?`)) {
                                                        onDelete(getId(hotel));
                                                    }
                                                }}
                                                title="Delete hotel"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedHotel === getId(hotel) && (
                                    <tr className="bg-light">
                                        <td colSpan={isAdmin ? 8 : 6} className="p-4">
                                            <div className="card border-0">
                                                <div className="card-body">
                                                    <h6 className="fw-bold mb-3">Hotel Details</h6>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <p className="mb-1">
                                                                <strong>Hotel Name:</strong> {getName(hotel)}
                                                            </p>
                                                            <p className="mb-1">
                                                                <strong>Location:</strong> {getLocation(hotel)}
                                                            </p>
                                                            <p className="mb-1">
                                                                <strong>Rating:</strong> {getRating(hotel).toFixed(1)} / 5
                                                            </p>
                                                            {isAdmin && getManager(hotel) && (
                                                                <p className="mb-1">
                                                                    <strong>Manager:</strong> {getManager(hotel).Name || getManager(hotel).name}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="col-md-6">
                                                            {isAdmin && (
                                                                <>
                                                                    <p className="mb-1">
                                                                        <strong>Total Rooms:</strong> {hotel.roomCount || 0}
                                                                    </p>
                                                                    <p className="mb-1">
                                                                        <strong>Total Bookings:</strong> {hotel.bookingCount || 0}
                                                                    </p>
                                                                    <p className="mb-1">
                                                                        <strong>Created:</strong> {hotel.createdAt ? new Date(hotel.createdAt).toLocaleDateString() : 'N/A'}
                                                                    </p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {hotel.Amenities && hotel.Amenities.length > 0 && (
                                                        <div className="mt-3">
                                                            <strong>Amenities:</strong>
                                                            <div className="d-flex flex-wrap gap-1 mt-1">
                                                                {hotel.Amenities.slice(0, 8).map((amenity, idx) => (
                                                                    <span key={idx} className="badge bg-secondary">{amenity}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={isAdmin ? 8 : 6} className="text-center py-5 text-muted">
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

