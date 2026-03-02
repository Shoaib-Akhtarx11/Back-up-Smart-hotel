import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateRoom, addRoom } from '../../../redux/roomSlice';

const RoomTable = ({ rooms, allHotels = [], managerHotels = [] }) => {
    const dispatch = useDispatch();
    const [editingRoomId, setEditingRoomId] = useState(null);
    const [roomType, setRoomType] = useState('');
    const [roomPrice, setRoomPrice] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [isAddingRoom, setIsAddingRoom] = useState(false);
    const [newRoomHotelId, setNewRoomHotelId] = useState('');
    const [newRoomType, setNewRoomType] = useState('');
    const [newRoomPrice, setNewRoomPrice] = useState('');

    // Start editing a room
    const startEdit = (room) => {
        setEditingRoomId(room.id);
        setRoomType(room.type);
        setRoomPrice(room.price.toString());
        setIsAvailable(room.availability === true || room.availability === 'true');
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingRoomId(null);
        setRoomType('');
        setRoomPrice('');
        setIsAvailable(true);
    };

    // Save the room changes
    const saveEdit = (room) => {
        // Check if price is empty or 0
        const price = parseFloat(roomPrice);
        if (!roomPrice || price <= 0) {
            alert('Please enter a valid price (must be greater than 0)');
            return;
        }

        // Create updated room object
        const updatedRoom = {
            ...room,
            type: roomType,
            price: price,
            availability: isAvailable
        };

        // Save to Redux
        dispatch(updateRoom(updatedRoom));

        // Save to localStorage
        const allRooms = JSON.parse(localStorage.getItem('allRooms') || '[]');
        const index = allRooms.findIndex(r => r.id === room.id);
        if (index >= 0) {
            allRooms[index] = updatedRoom;
        }
        localStorage.setItem('allRooms', JSON.stringify(allRooms));

        alert('Room updated successfully!');
        setEditingRoomId(null);
    };

    // Get hotel name from hotel ID
    const getHotelName = (hotelId) => {
        const hotel = allHotels.find(h => h.id === hotelId);
        return hotel ? hotel.name : hotelId;
    };

    // Add new room
    const addNewRoom = () => {
        // Validation
        if (!newRoomHotelId) {
            alert('Please select a hotel');
            return;
        }
        if (!newRoomType.trim()) {
            alert('Please enter room type');
            return;
        }
        const price = parseFloat(newRoomPrice);
        if (!newRoomPrice || price <= 0) {
            alert('Please enter a valid price (must be greater than 0)');
            return;
        }

        // Create new room ID
        const newRoomId = `R-${newRoomHotelId}-${Math.random().toString(36).substr(2, 9)}`;

        // Create new room object
        const newRoom = {
            id: newRoomId,
            hotelId: newRoomHotelId,
            type: newRoomType,
            price: price,
            availability: true,
            image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500'
        };

        // Save to Redux
    
    dispatch(addRoom(newRoom));        // Save to localStorage
        const allRooms = JSON.parse(localStorage.getItem('allRooms') || '[]');
        allRooms.push(newRoom);
        localStorage.setItem('allRooms', JSON.stringify(allRooms));

        alert('Room added successfully!');
        
        // Reset form
        setIsAddingRoom(false);
        setNewRoomHotelId('');
        setNewRoomType('');
        setNewRoomPrice('');
    };

    const cancelAddRoom = () => {
        setIsAddingRoom(false);
        setNewRoomHotelId('');
        setNewRoomType('');
        setNewRoomPrice('');
    };

    return (
        <div>
            {/* Add Room Button */}
            {!isAddingRoom && (
                <button
                    className="btn btn-success mb-3"
                    onClick={() => setIsAddingRoom(true)}
                >
                    + Add New Room
                </button>
            )}

            {/* Add Room Form */}
            {isAddingRoom && (
                <div className="card border-2 border-success p-3 mb-3">
                    <h5 className="fw-bold mb-3">Add New Room</h5>
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Select Hotel</label>
                            <select
                                className="form-control"
                                value={newRoomHotelId}
                                onChange={(e) => setNewRoomHotelId(e.target.value)}
                            >
                                <option value="">-- Choose Your Hotel --</option>
                                {managerHotels.map(hotel => (
                                    <option key={hotel.id} value={hotel.id}>
                                        {hotel.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Room Type</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newRoomType}
                                onChange={(e) => setNewRoomType(e.target.value)}
                                placeholder="e.g. Deluxe Room"
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Price (₹)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={newRoomPrice}
                                onChange={(e) => setNewRoomPrice(e.target.value)}
                                placeholder="Enter price"
                                min="1"
                            />
                        </div>
                        <div className="col-md-3 d-flex align-items-end gap-2">
                            <button
                                className="btn btn-success flex-grow-1"
                                onClick={addNewRoom}
                            >
                                Add Room
                            </button>
                            <button
                                className="btn btn-secondary flex-grow-1"
                                onClick={cancelAddRoom}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rooms Table */}
            <div className="table-responsive">
            <table className="table table-hover mb-0">
                <thead className="table-light">
                    <tr>
                        <th className="ps-3">Hotel</th>
                        <th>Room Type</th>
                        <th>Price (₹)</th>
                        <th>Status</th>
                        <th className="text-end pe-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.length > 0 ? (
                        rooms.map((room) => (
                            <tr key={room.id}>
                                {editingRoomId === room.id ? (
                                    // EDIT MODE
                                    <>
                                        <td className="ps-3" colSpan="5">
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
                                        <td className="ps-3 fw-bold">{getHotelName(room.hotelId)}</td>
                                        <td>{room.type}</td>
                                        <td>
                                            <span className="badge bg-info text-dark">
                                                ₹{room.price.toLocaleString()}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${room.availability === true || room.availability === 'true' ? 'bg-success' : 'bg-danger'}`}>
                                                {room.availability === true || room.availability === 'true' ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td className="text-end pe-3">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => startEdit(room)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-5 text-muted">
                                No rooms available
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
