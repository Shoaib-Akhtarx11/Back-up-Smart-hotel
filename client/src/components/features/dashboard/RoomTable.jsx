import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateManagerRoom, deleteManagerRoom } from '../../../redux/managerSlice';

const RoomTable = ({ rooms = [], allHotels = [], managerHotels = [], onDelete }) => {
    const dispatch = useDispatch();
    const [editingRoomId, setEditingRoomId] = useState(null);
    const [roomType, setRoomType] = useState('');
    const [roomPrice, setRoomPrice] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [isAddingRoom, setIsAddingRoom] = useState(false);
    const [newRoomHotelId, setNewRoomHotelId] = useState('');
    const [newRoomType, setNewRoomType] = useState('');
    const [newRoomPrice, setNewRoomPrice] = useState('');

    // Use managerHotels if provided, otherwise fallback to allHotels
    const hotels = managerHotels.length > 0 ? managerHotels : allHotels;

    // Get hotel name from hotel object or ID
    const getHotelName = (hotel) => {
        if (!hotel) return 'N/A';
        if (typeof hotel === 'string') {
            const foundHotel = hotels.find(h => h._id === hotel || h.id === hotel);
            return foundHotel?.Name || foundHotel?.name || 'Unknown Hotel';
        }
        return hotel.Name || hotel.name || 'Unknown Hotel';
    };

    // Get hotel ID from various formats
    const getHotelId = (room) => {
        if (room.HotelID?._id) return room.HotelID._id;
        if (room.HotelID?.id) return room.HotelID.id;
        return room.HotelID || room.hotelId || '';
    };

    // Start editing a room
    const startEdit = (room) => {
        setEditingRoomId(room._id);
        setRoomType(room.Type || room.type || '');
        setRoomPrice(room.Price?.toString() || room.price?.toString() || '');
        setIsAvailable(room.Availability === true || room.Availability === 'true' || room.availability === true || room.availability === 'true');
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingRoomId(null);
        setRoomType('');
        setRoomPrice('');
        setIsAvailable(true);
    };

    // Save the room changes via API
    const saveEdit = (room) => {
        // Check if price is empty or 0
        const price = parseFloat(roomPrice);
        if (!roomPrice || price <= 0) {
            alert('Please enter a valid price (must be greater than 0)');
            return;
        }

        // Create updated room object
        const updatedRoom = {
            Type: roomType,
            Price: price,
            Availability: isAvailable
        };

        // Call API to update room
        dispatch(updateManagerRoom({ roomId: room._id, roomData: updatedRoom }))
            .then(() => {
                alert('Room updated successfully!');
                setEditingRoomId(null);
            })
            .catch((err) => {
                alert(err.message || 'Failed to update room');
            });
    };

    // Handle delete room
    const handleDelete = (roomId) => {
        if (onDelete) {
            onDelete(roomId);
        }
    };

    // Render availability badge
    const renderAvailability = (room) => {
        const isRoomAvailable = room.Availability === true || room.Availability === 'true' || room.availability === true || room.availability === 'true';
        return (
            <span className={`badge ${isRoomAvailable ? 'bg-success' : 'bg-danger'}`}>
                {isRoomAvailable ? 'Available' : 'Unavailable'}
            </span>
        );
    };

    return (
        <div>
            {/* Rooms Table */}
            <div className="table-responsive">
            <table className="table table-hover mb-0">
                <thead className="table-light">
                    <tr>
                        <th className="ps-3">Hotel</th>
                        <th>Room Type</th>
                        <th>Price (₹)</th>
                        <th>Status</th>
                        <th>Bookings</th>
                        <th className="text-end pe-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.length > 0 ? (
                        rooms.map((room) => (
                            <tr key={room._id}>
                                {editingRoomId === room._id ? (
                                    // EDIT MODE
                                    <>
                                        <td className="ps-3" colSpan="6">
                                            <div className="card border-2 border-primary p-3">
                                                <div className="row mb-3">
                                                    <div className="col-md-4">
                                                        <label className="form-label fw-bold">Room Type</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={roomType}
                                                            onChange={(e) => setRoomType(e.target.value)}
                                                            placeholder="e.g. Deluxe Room"
                                                        />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label fw-bold">Price (₹)</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            value={roomPrice}
                                                            onChange={(e) => setRoomPrice(e.target.value)}
                                                            placeholder="Enter price"
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label fw-bold">Status</label>
                                                        <select
                                                            className="form-control"
                                                            value={isAvailable ? 'available' : 'unavailable'}
                                                            onChange={(e) => setIsAvailable(e.target.value === 'available')}
                                                        >
                                                            <option value="available">Available</option>
                                                            <option value="unavailable">Unavailable</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="d-flex gap-2 justify-content-end">
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={cancelEdit}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        className="btn btn-success"
                                                        onClick={() => saveEdit(room)}
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    // VIEW MODE
                                    <>
                                        <td className="ps-3 fw-bold">{getHotelName(room.HotelID)}</td>
                                        <td>{room.Type || room.type || 'N/A'}</td>
                                        <td>
                                            <span className="badge bg-info text-dark">
                                                ₹{(room.Price || room.price || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td>{renderAvailability(room)}</td>
                                        <td>{room.bookingCount || 0}</td>
                                        <td className="text-end pe-3">
                                            <div className="btn-group btn-group-sm" role="group">
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={() => startEdit(room)}
                                                    title="Edit"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger"
                                                    onClick={() => handleDelete(room._id)}
                                                    title="Delete"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center py-5 text-muted">
                                No rooms available. Add a hotel first, then add rooms to it.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default RoomTable;

