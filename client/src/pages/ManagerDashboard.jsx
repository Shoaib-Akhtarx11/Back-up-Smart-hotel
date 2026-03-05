import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { fetchManagerDashboardData, selectManagerDashboardData } from '../redux/managerSlice';
import { FaBuilding, FaBed, FaCalendarCheck, FaStar, FaSignOutAlt, FaHome, FaChartBar, FaMoneyBillWave, FaExclamationCircle } from 'react-icons/fa';

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

  // Get role from user object
  const userRole = auth.user?.Role || localStorage.getItem('activeRole');

  // Get ALL data from the new API (no localStorage)
  const dashboardData = useSelector(selectManagerDashboardData);
  const loading = managerState.loading;
  const error = managerState.error;

  // Fetch all dashboard data from the API using aggregation
  useEffect(() => {
    if (userRole === 'manager' || userRole === 'admin') {
      dispatch(fetchManagerDashboardData());
    }
  }, [dispatch, userRole]);

  // Redirect if not a manager
  useEffect(() => {
    if (userRole && userRole !== 'manager' && userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, navigate]);

  // Use data from API (dashboardData)
  const managerHotels = dashboardData?.hotels || [];
  const managerRooms = dashboardData?.rooms || [];
  const managerBookings = dashboardData?.bookings || [];
  const statistics = dashboardData?.statistics || {};

  // Statistics from API
  const totalHotels = statistics.totalHotels || managerHotels.length;
  const totalRooms = statistics.totalRooms || managerRooms.length;
  const totalBookings = statistics.totalBookings || managerBookings.length;
  const confirmedBookings = statistics.confirmedBookings || 0;
  const totalRevenue = statistics.totalRevenue || 0;
  const averageRating = statistics.averageRating || 0;

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
    // Refresh dashboard data after adding hotel
    dispatch(fetchManagerDashboardData());
  };

  const handleEditHotel = {
    onEdit: (hotel) => {
      navigate(`/add-hotel?edit=${hotel._id || hotel.id}`);
    },
    onDelete: async (hotelId) => {
      if (window.confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5600/api'}/hotels/${hotelId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            }
          });
          const data = await response.json();
          if (data.success) {
            alert('Hotel deleted successfully!');
            // Refresh dashboard data
            dispatch(fetchManagerDashboardData());
          } else {
            alert(data.message || 'Failed to delete hotel');
          }
        } catch (err) {
          console.error('Error deleting hotel:', err);
          alert('Failed to delete hotel. Please try again.');
        }
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
    // Refresh dashboard data after saving room
    dispatch(fetchManagerDashboardData());
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5600/api'}/rooms/${roomId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });
        const data = await response.json();
        if (data.success) {
          alert('Room deleted successfully!');
          // Refresh dashboard data
          dispatch(fetchManagerDashboardData());
        } else {
          alert(data.message || 'Failed to delete room');
        }
      } catch (err) {
        console.error('Error deleting room:', err);
        alert('Failed to delete room. Please try again.');
      }
    }
  };

  // Handler for approving a booking
  const handleApproveBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5600/api'}/bookings/${bookingId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ Status: 'confirmed' }),
        }
      );
      const data = await response.json();
      if (data.success) {
        alert('Booking approved successfully!');
        // Refresh dashboard data
        dispatch(fetchManagerDashboardData());
      } else {
        alert(data.message || 'Failed to approve booking');
      }
    } catch (err) {
      console.error('Error approving booking:', err);
      alert('Failed to approve booking. Please try again.');
    }
  };

  // Handler for disapproving/cancelling a booking
  const handleDisapproveBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to disapprove this booking?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5600/api'}/bookings/${bookingId}/status`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({ Status: 'cancelled' }),
          }
        );
        const data = await response.json();
        if (data.success) {
          alert('Booking disapproved successfully!');
          // Refresh dashboard data
          dispatch(fetchManagerDashboardData());
        } else {
          alert(data.message || 'Failed to disapprove booking');
        }
      } catch (err) {
        console.error('Error disapproving booking:', err);
        alert('Failed to disapprove booking. Please try again.');
      }
    }
  };

  // Show loading state
  if (loading && !dashboardData) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Loading dashboard...</h5>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="fs-1 mb-3 text-danger"><FaExclamationCircle /></div>
          <h5 className="text-danger">Error Loading Dashboard</h5>
          <p className="text-muted">{error}</p>
          <button className="btn btn-primary" onClick={() => dispatch(fetchManagerDashboardData())}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

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

        {/* Additional Statistics Row */}
        <div className="row mb-4 g-3">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-success text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75">Total Revenue</p>
                  <h3 className="fw-bold mb-0">Rs.{totalRevenue.toLocaleString()}</h3>
                </div>
                <FaMoneyBillWave className="fs-1 opacity-50" />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-warning text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75">Average Rating</p>
                  <h3 className="fw-bold mb-0">{averageRating > 0 ? `${averageRating} ★` : 'N/A'}</h3>
                </div>
                <FaStar className="fs-1 opacity-50" />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-info text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75">Pending Bookings</p>
                  <h3 className="fw-bold mb-0">{statistics.pendingBookings || 0}</h3>
                </div>
                <FaCalendarCheck className="fs-1 opacity-50" />
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
              />
            </div>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="card shadow-sm border-0 rounded-bottom-4">
            <div className="card-body p-4">
              <ManagerRoomList 
                onAddRoom={handleAddRoom}
                onEditRoom={{ onEdit: handleEditRoom }}
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
                        <th>Room Type</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managerBookings.map(booking => {
                        const statusClass = booking.Status === 'confirmed' || booking.Status === 'Confirmed' ? 'bg-success' :
                                           booking.Status === 'cancelled' || booking.Status === 'Cancelled' ? 'bg-danger' : 'bg-warning';
                        const isApproved = booking.Status === 'confirmed' || booking.Status === 'Confirmed';
                        const isCancelled = booking.Status === 'cancelled' || booking.Status === 'Cancelled';
                        
                        return (
                          <tr key={booking._id || booking.BookingID}>
                            <td className="fw-bold">{booking.RoomID?.HotelID?.Name || 'N/A'}</td>
                            <td>{booking.UserID?.Name || 'Guest'}</td>
                            <td>{booking.RoomID?.Type || 'N/A'}</td>
                            <td>{new Date(booking.CheckInDate).toLocaleDateString()}</td>
                            <td>{new Date(booking.CheckOutDate).toLocaleDateString()}</td>
                            <td><span className={`badge ${statusClass}`}>{booking.Status}</span></td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-success me-1"
                                disabled={isApproved}
                                onClick={() => handleApproveBooking(booking._id)}
                                title={isApproved ? 'Already approved' : 'Approve this booking'}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                disabled={isCancelled}
                                onClick={() => handleDisapproveBooking(booking._id)}
                                title={isCancelled ? 'Already cancelled' : 'Cancel this booking'}
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

