import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { fetchCurrentManager } from '../redux/managerSlice';
import { FaBuilding, FaBed, FaCalendarCheck, FaStar, FaSignOutAlt, FaHome, FaChartBar } from 'react-icons/fa';

// Manager Components - Direct imports
import ManagerHotelList from '../components/features/manager/ManagerHotelList';
import ManagerRoomList from '../components/features/manager/ManagerRoomList';
import ManagerReviews from '../components/features/manager/ManagerReviews';
import AddHotelForm from '../components/features/manager/AddHotelForm';
import AddRoomForm from '../components/features/manager/AddRoomForm';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('hotels');
  const [showAddHotel, setShowAddHotel] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Get auth state
  const auth = useSelector((state) => state.auth);
  const managerState = useSelector((state) => state.manager);
  const currentManager = auth.user;
  let managerId = currentManager?._id || currentManager?.id;
  
  // Try to get from localStorage if not in Redux
  if (!managerId) {
    try {
      const storedUser = localStorage.getItem('activeUser');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        managerId = parsed._id || parsed.id;
      }
    } catch (e) {
      console.error('Error getting manager ID:', e);
    }
  }

  // Get role
  const userRole = auth.role || localStorage.getItem('activeRole');

  // Fetch current manager profile from backend
  useEffect(() => {
    if (userRole === 'manager' || userRole === 'admin') {
      dispatch(fetchCurrentManager());
    }
  }, [dispatch, userRole]);

  // Redirect if not a manager
  useEffect(() => {
    if (userRole && userRole !== 'manager' && userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, navigate]);

  // Get data from Redux
  const allHotels = useSelector((state) => state.hotels?.allHotels || []);
  const allRooms = useSelector((state) => state.rooms?.allRooms || []);
  const allBookings = useSelector((state) => state.bookings?.allBookings || []);

  // Get manager's hotels
  const getManagerHotels = () => {
    const reduxHotels = allHotels || [];
    const storedHotels = JSON.parse(localStorage.getItem('allHotels') || '[]');
    
    const hotelMap = new Map();
    reduxHotels.forEach(h => hotelMap.set(h._id || h.id, h));
    storedHotels.forEach(h => hotelMap.set(h._id || h.id, h));
    
    const allHotelsFromBoth = Array.from(hotelMap.values());
    
    return allHotelsFromBoth.filter(hotel => {
      const hotelManagerId = hotel.ManagerID?._id || hotel.ManagerID || hotel.managerId;
      return hotelManagerId === managerId || hotelManagerId === String(managerId);
    });
  };

  const managerHotels = getManagerHotels();
  const managerHotelIds = managerHotels.map(h => h._id || h.id);

  // Get manager's rooms
  const getManagerRooms = () => {
    const storedRooms = JSON.parse(localStorage.getItem('allRooms') || '[]');
    const reduxRooms = allRooms;
    
    const roomMap = new Map();
    reduxRooms.forEach(r => roomMap.set(r._id || r.id, r));
    storedRooms.forEach(r => roomMap.set(r._id || r.id, r));
    
    const allRoomsFromBoth = Array.from(roomMap.values());
    
    return allRoomsFromBoth.filter(room => {
      const roomHotelId = room.HotelID?._id || room.HotelID || room.hotelId;
      return managerHotelIds.includes(roomHotelId) || managerHotelIds.includes(String(roomHotelId));
    });
  };

  const managerRooms = getManagerRooms();

  // Get manager's bookings
  const managerBookings = allBookings.filter(booking =>
    managerHotelIds.includes(booking.hotelId) || managerHotelIds.includes(String(booking.hotelId))
  );

  // Statistics
  const totalHotels = managerHotels.length;
  const totalRooms = managerRooms.length;
  const totalBookings = managerBookings.length;
  const confirmedBookings = managerBookings.filter(b => b.status === 'Confirmed' || b.Status === 'Confirmed').length;

  // Logout handler
  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('activeUser');
    localStorage.removeItem('activeRole');
    navigate('/');
  };

  // Handlers for hotel management
  const handleAddHotel = () => {
    setShowAddHotel(true);
  };

  const handleHotelAdded = () => {
    setShowAddHotel(false);
    window.location.reload();
  };

  const handleEditHotel = {
    onEdit: (hotel) => {
      navigate(`/add-hotel?edit=${hotel._id || hotel.id}`);
    },
    onDelete: (hotelId) => {
      if (window.confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
        const storedHotels = JSON.parse(localStorage.getItem('allHotels') || '[]');
        const filteredHotels = storedHotels.filter(h => (h._id || h.id) !== hotelId);
        localStorage.setItem('allHotels', JSON.stringify(filteredHotels));
        alert('Hotel deleted successfully!');
        window.location.reload();
      }
    }
  };

  const handleViewHotel = (hotel) => {
    navigate(`/hotel/${hotel._id || hotel.id}`);
  };

  // Handlers for room management
  const handleAddRoom = () => {
    setEditingRoom(null);
    setShowAddRoom(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setShowAddRoom(true);
  };

  const handleRoomSaved = () => {
    setShowAddRoom(false);
    setEditingRoom(null);
    window.location.reload();
  };

  const handleDeleteRoom = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      const storedRooms = JSON.parse(localStorage.getItem('allRooms') || '[]');
      const filteredRooms = storedRooms.filter(r => (r._id || r.id) !== roomId);
      localStorage.setItem('allRooms', JSON.stringify(filteredRooms));
      alert('Room deleted successfully!');
      window.location.reload();
    }
  };

  // Show Add Hotel Form
  if (showAddHotel) {
    return (
      <div className="bg-light min-vh-100 d-flex flex-column">
        <div className="container mt-4 mb-5 flex-grow-1" style={{ maxWidth: '800px' }}>
          <button 
            className="btn btn-outline-secondary mb-3"
            onClick={() => setShowAddHotel(false)}
          >
            Back to Dashboard
          </button>
          <AddHotelForm 
            onSuccess={handleHotelAdded}
            onCancel={() => setShowAddHotel(false)}
          />
        </div>
        </div>
    );
  }

  // Show Add/Edit Room Form
  if (showAddRoom) {
    return (
      <div className="bg-light min-vh-100 d-flex flex-column">
        <div className="container mt-4 mb-5 flex-grow-1" style={{ maxWidth: '800px' }}>
          <button 
            className="btn btn-outline-secondary mb-3"
            onClick={() => {
              setShowAddRoom(false);
              setEditingRoom(null);
            }}
          >
            Back to Dashboard
          </button>
          <AddRoomForm 
            hotels={managerHotels}
            editRoom={editingRoom}
            onSuccess={handleRoomSaved}
            onCancel={() => {
              setShowAddRoom(false);
              setEditingRoom(null);
            }}
          />
        </div>
        </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <div className="container-fluid mt-4 mb-5 flex-grow-1" style={{ maxWidth: '1400px' }}>
        {/* Header */}
        <div className="mb-4 d-flex align-items-center justify-content-between">
          <div>
            <h2 className="fw-bold">Manager Dashboard</h2>
            <p className="text-muted">Manage hotels, rooms, and monitor bookings</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary rounded-pill px-4"
              onClick={() => navigate('/')}
            >
              <FaHome /> Home
            </button>
            <button
              className="btn btn-danger rounded-pill px-4"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
          </div>

        {/* Statistics Cards */}
        <div className="row mb-4 g-3">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75">Total Hotels</p>
                  <h3 className="fw-bold mb-0">{totalHotels}</h3>
                </div>
                <FaBuilding className="fs-1 opacity-50" />
              </div>
          </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-info text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75">Total Rooms</p>
                  <h3 className="fw-bold mb-0">{totalRooms}</h3>
                </div>
                <FaBed className="fs-1 opacity-50" />
              </div>
          </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-success text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75">Total Bookings</p>
                  <h3 className="fw-bold mb-0">{totalBookings}</h3>
                </div>
                <FaCalendarCheck className="fs-1 opacity-50" />
              </div>
          </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-warning text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75">Confirmed</p>
                  <h3 className="fw-bold mb-0">{confirmedBookings}</h3>
                </div>
                <FaChartBar className="fs-1 opacity-50" />
              </div>
              </div>
          </div>
          </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4 border-bottom-0" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link fw-bold rounded-top ${activeTab === 'hotels' ? 'active bg-white' : 'bg-light'}`}
              onClick={() => setActiveTab('hotels')}
            >
              <FaBuilding className="me-2" />Hotels
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link fw-bold rounded-top ${activeTab === 'rooms' ? 'active bg-white' : 'bg-light'}`}
              onClick={() => setActiveTab('rooms')}
            >
              <FaBed className="me-2" />Rooms
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link fw-bold rounded-top ${activeTab === 'bookings' ? 'active bg-white' : 'bg-light'}`}
              onClick={() => setActiveTab('bookings')}
            >
              <FaCalendarCheck className="me-2" />Bookings
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link fw-bold rounded-top ${activeTab === 'reviews' ? 'active bg-white' : 'bg-light'}`}
              onClick={() => setActiveTab('reviews')}
            >
              <FaStar className="me-2" />Reviews
            </button>
          </li>
        </ul>

        {/* Hotels Tab */}
        {activeTab === 'hotels' && (
          <div className="card shadow-sm border-0 rounded-bottom-4">
            <div className="card-body p-4">
              <ManagerHotelList 
                onAddHotel={handleAddHotel}
                onEditHotel={handleEditHotel}
                onViewHotel={handleViewHotel}
              />
            </div>
            </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="card shadow-sm border-0 rounded-bottom-4">
            <div className="card-body p-4">
              <ManagerRoomList 
                hotels={managerHotels}
                onAddRoom={handleAddRoom}
                onEditRoom={{ onEdit: handleEditRoom }}
                onDeleteRoom={handleDeleteRoom}
              />
            </div>
            </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="card shadow-sm border-0 rounded-bottom-4">
            <div className="card-body p-4">
              {managerBookings.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Hotel</th>
                        <th>Guest</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managerBookings.map(booking => {
                        const hotel = managerHotels.find(h => (h._id || h.id) === (booking.hotelId || booking.HotelID));
                        const statusClass = booking.Status === 'Confirmed' || booking.status === 'Confirmed' ? 'bg-success' :
                                           booking.Status === 'Cancelled' || booking.status === 'Cancelled' ? 'bg-danger' : 'bg-warning';
                        const isApproved = booking.Status === 'Confirmed' || booking.status === 'Confirmed';
                        
                        return (
                          <tr key={booking.BookingID || booking._id}>
                            <td className="fw-bold">{hotel?.Name || hotel?.name || 'N/A'}</td>
                            <td>{booking.GuestName || booking.guestName || 'Guest'}</td>
                            <td>{new Date(booking.CheckInDate || booking.checkInDate).toLocaleDateString()}</td>
                            <td>{new Date(booking.CheckOutDate || booking.checkOutDate).toLocaleDateString()}</td>
                            <td className="fw-bold">Rs.{(booking.TotalPrice || booking.totalPrice || 0).toLocaleString()}</td>
                            <td><span className={`badge ${statusClass}`}>{booking.Status || booking.status}</span></td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-success me-1"
                                disabled={isApproved}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                disabled={booking.Status === 'Cancelled' || booking.status === 'Cancelled'}
                              >
                                Disapprove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 bg-light rounded-4 border">
                  <div className="fs-1 mb-3">📅</div>
                  <h5 className="fw-bold">No Bookings Yet</h5>
                  <p className="text-muted mb-3">Once guests book your hotels, their bookings will appear here.</p>
                </div>
              )}
            </div>
            </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="card shadow-sm border-0 rounded-bottom-4">
            <div className="card-body p-4">
              <ManagerReviews hotels={managerHotels} />
            </div>
            </div>
        )}
      </div>
      </div>
  );
};

export default ManagerDashboard;
