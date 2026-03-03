import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
// import { deleteHotel } from '../redux/hotelSlice';
import { logout } from '../redux/authSlice';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Footer from '../components/layout/Footer';
import HotelTable from '../components/features/dashboard/HotelTable';
import RoomTable from '../components/features/dashboard/RoomTable';
import { FaBuilding, FaBed, FaCalendarCheck, FaChartBar, FaStar, FaSignOutAlt } from 'react-icons/fa';
// import users from "../data/users.json"
import users from "../data/users.json"
 
const ManagerDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('hotels');
    const [searchRoom, setSearchRoom] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [hotelToDelete, setHotelToDelete] = useState(null);
    

    // console.log(allUsers)
    // Get current manager from auth state
    const auth = useSelector((state) => state.auth);
    let currentManager = auth.user;
    
    const storedUsers = JSON.parse(localStorage.getItem("allUsers") ||"null");
    const allUsers = [...users,...storedUsers]
    // Logout handler
    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };
   
    // If auth.user is null but localStorage has activeUser, restore it
    if (!currentManager) {
        try {
            const storedUser = localStorage.getItem('activeUser');
            if (storedUser) {
                currentManager = JSON.parse(storedUser);
            }
        } catch (e) {
            console.error('Error restoring user from localStorage:', e);
        }
    }
   
    // Ensure managerId is a number for proper comparison with hotel.managerId
    const managerId = currentManager?.id ? (typeof currentManager.id === 'string' ? parseInt(currentManager.id) : currentManager.id) : null;
    const userRole = auth.role || localStorage.getItem('activeRole');
   
    // Redirect if not a manager
    React.useEffect(() => {
        if (userRole && userRole !== 'manager') {
            navigate("/");
        }
    }, [userRole, navigate]);
   
    // Get data from Redux
    const allHotels = useSelector((state) => state.hotels?.allHotels || []);
    const allRooms = useSelector((state) => state.rooms?.allRooms || []);
    const allBookings = useSelector((state) => state.bookings?.allBookings || []);
    const allReviews = useSelector((state) => state.reviews?.allReviews || []);
   
    // Get fresh hotels from localStorage to ensure newly created hotels are shown
    const getManagerHotels = () => {
        // Priority: Use Redux hotels first (initial data), then merge with localStorage
        const reduxHotels = allHotels || [];
        const storedHotels = JSON.parse(localStorage.getItem('allHotels') || '[]');
       
        // Merge: Redux hotels + localStorage updates
        const hotelMap = new Map();
        reduxHotels.forEach(h => hotelMap.set(h.id, h));
        storedHotels.forEach(h => hotelMap.set(h.id, h));
       
        const allHotelsFromBoth = Array.from(hotelMap.values());
       
        // Log for debugging
        // console.log('Manager ID:', managerId);
        // console.log('Current Manager:', currentManager);
        // console.log('All Hotels Count:', allHotelsFromBoth.length);
        // console.log('Redux Hotels:', reduxHotels.length);
        // console.log('Stored Hotels:', storedHotels.length);
       
        // Filter using strict equality and handle edge cases
        if (!managerId && managerId !== 0) {
            console.warn('Manager ID is not set:', managerId);
            return [];
        }
       
        const filtered = allHotelsFromBoth.filter(hotel => {
            const hotelManagerId = hotel.managerId;
            const matches = hotelManagerId === managerId;
            return matches;
        });
       
        // console.log('Filtered Hotels for Manager', managerId, ':', filtered.length);
        if (filtered.length === 0) {
            console.log('Available hotels by managerId:',
                allHotelsFromBoth.reduce((acc, h) => {
                    if (!acc[h.managerId]) acc[h.managerId] = 0;
                    acc[h.managerId]++;
                    return acc;
                }, {})
            );
        }
       
        return filtered;
    };
   
    // Filter hotels to only show those managed by current manager
    const managerHotels = getManagerHotels();
   
    // Get rooms for manager's hotels
    const managerHotelIds = managerHotels.map(h => h.id);
    const managerRooms = allRooms.filter(room => managerHotelIds.includes(room.hotelId));
   
    // Get bookings for manager's rooms
    const managerBookings = allBookings.filter(booking =>
        managerHotelIds.includes(booking.hotelId)
    );
 
    // Get reviews for manager's hotels
    const managerReviews = allReviews.filter(review =>
        managerHotelIds.includes(review.hotelId) && !review.isDeleted
    );
   
    // Calculate average rating from reviews
    const avgRating = managerReviews.length > 0
        ? (managerReviews.reduce((sum, r) => sum + r.rating, 0) / managerReviews.length).toFixed(1)
        : 0;
 
    const handleDeleteHotel = (id) => {
        setHotelToDelete(id);
        setShowDeleteConfirm(true);
    };
 
    const confirmDeleteHotel = () => {
        try {
            if (hotelToDelete) {
                dispatch(deleteHotel(hotelToDelete));
               
                // Also delete from localStorage
                const allHotelsFromStorage = JSON.parse(localStorage.getItem('allHotels') || '[]');
                const filteredHotels = allHotelsFromStorage.filter(h => h.id !== hotelToDelete);
                localStorage.setItem('allHotels', JSON.stringify(filteredHotels));
               
                setShowDeleteConfirm(false);
                setHotelToDelete(null);
                alert('Hotel deleted successfully');
            }
        } catch (error) {
            console.error("Delete Hotel Error:", error);
            navigate("/error", {
                state: { message: "Failed to delete the hotel. Please refresh and try again." }
            });
        }
    };
 
    // Statistics
    const totalHotels = managerHotels.length;
    const totalRooms = managerRooms.length;
    const totalBookings = managerBookings.length;
    const confirmedBookings = managerBookings.filter(b => b.status === 'Confirmed').length;
 
    return (
        <div className="bg-light min-vh-100 d-flex flex-column">
            <div className="container-fluid mt-4 mb-5 flex-grow-1" style={{ maxWidth: '1400px' }}>
                {/* Header */}
                <div className="mb-4 d-flex align-items-center justify-content-between">
                    <div>
                        <h2 className="fw-bold">🏨 Manager Dashboard</h2>
                        <p className="text-muted">Manage hotels, rooms, and monitor bookings</p>
                    </div>
                    <button
                        className="btn btn-danger rounded-pill px-4 d-flex align-items-center gap-2"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <FaSignOutAlt /> Logout
                    </button>
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
                            {managerHotels.length > 0 ? (
                                <HotelTable
                                    hotels={managerHotels}
                                    onDelete={handleDeleteHotel}
                                    isManager={true}
                                />
                            ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted mb-3">No hotels assigned yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
 
                {/* Rooms Tab */}
                {activeTab === 'rooms' && (
                    <div className="card shadow-sm border-0 rounded-bottom-4">
                        <div className="card-body p-4">
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    placeholder="Search by room type or hotel..."
                                    value={searchRoom}
                                    onChange={(e) => setSearchRoom(e.target.value)}
                                />
                            </div>
                            {managerRooms.length > 0 ? (
                                <RoomTable
                                    rooms={managerRooms.filter(room =>
                                        room.type?.toLowerCase().includes(searchRoom.toLowerCase()) ||
                                        allHotels.find(h => h.id === room.hotelId)?.name.toLowerCase().includes(searchRoom.toLowerCase())
                                    )}
                                    allHotels={allHotels}
                                    managerHotels={managerHotels}
                                    onDelete={null}
                                />
                            ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted">No rooms available yet. Add hotels to get started.</p>
                                </div>
                            )}
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
                                                <th>Guest Name</th>
                                                <th>Email</th>
                                                <th>Check-in</th>
                                                <th>Check-out</th>
                                                <th>Total Price</th>
                                                <th>Status</th>
                                                <th className="text-end pe-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {managerBookings.map(booking => {
                                                const hotel = allHotels.find(h => h.id === booking.hotelId);
                                                const statusClass = booking.Status === 'Confirmed' ? 'bg-success' :
                                                                   booking.Status === 'Cancelled' ? 'bg-danger' : 'bg-warning';
                                                const isApproved = booking.Status === 'Confirmed';
                                                const user = allUsers.find(u => u.id === booking.UserID);
                                                // console.log(user,allUsers)
                                                // const user = allUsers.find(user => user.id === booking.UserID);
                                                return (
                                                    <tr key={booking.BookingID}>
                                                        <td className="fw-bold">{hotel?.name}</td>
                                                        <td>{user?.name || booking.UserID}</td>
                                                        <td>{user?.email || "guest@email.com"}</td>
                                                        <td>{user?.name || booking.BookingID}</td>
                                                        <td>{user?.email || "guest@email.com"}</td>
                                                        <td>{new Date(booking.CheckInDate).toLocaleDateString()}</td>
                                                        <td>{new Date(booking.CheckOutDate).toLocaleDateString()}</td>
                                                        <td className="fw-bold">₹{booking.TotalPrice.toLocaleString()}</td>
                                                        <td><span className={`badge ${statusClass}`}>{booking.Status}</span></td>
                                                        <td className="text-end pe-3">
                                                            <div className="btn-group btn-group-sm" role="group">
                                                                <button
                                                                    className="btn btn-outline-success"
                                                                    onClick={() => {
                                                                        alert(`Booking ${booking.BookingID} approved! Status changed to Confirmed.`);
                                                                    }}
                                                                    disabled={isApproved}
                                                                    title="Approve booking"
                                                                >
                                                                    <i className="bi bi-check-circle me-1"></i>Approve
                                                                </button>
                                                                <button
                                                                    className="btn btn-outline-danger"
                                                                    onClick={() => {
                                                                        if(window.confirm(`Are you sure you want to disapprove booking ${booking.BookingID}?`)) {
                                                                            alert(`Booking ${booking.BookingID} disapproved! Status changed to Cancelled.`);
                                                                        }
                                                                    }}
                                                                    disabled={booking.Status === 'Cancelled'}
                                                                    title="Disapprove booking"
                                                                >
                                                                    <i className="bi bi-x-circle me-1"></i>Disapprove
                                                                </button>
                                                            </div>
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
                            {managerReviews.length > 0 ? (
                                <div>
                                    <div className="mb-4 p-4 bg-light rounded-4">
                                        <div className="row text-center">
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Average Rating</p>
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <h3 className="fw-bold mb-0">{avgRating}</h3>
                                                    <span className="text-warning fs-4">★</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Total Reviews</p>
                                                <h3 className="fw-bold mb-0">{managerReviews.length}</h3>
                                            </div>
                                        </div>
                                    </div>
                                   
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Hotel</th>
                                                    <th>Guest</th>
                                                    <th>Rating</th>
                                                    <th>Review</th>
                                                    <th>Date</th>
                                                    <th>Manager Response</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {managerReviews.map((review, idx) => {
                                                    const hotel = allHotels.find(h => h.id === review.hotelId);
                                                    return (
                                                        <tr key={review.id || idx}>
                                                            <td className="fw-bold">{hotel?.name}</td>
                                                            <td>{review.guestName}</td>
                                                            <td>
                                                                <div className="text-warning">
                                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                                        <span key={i} style={{ color: i < review.rating ? '#FFC107' : '#E0E0E0' }}>
                                                                            ★
                                                                        </span>
                                                                    ))}
                                                                </div>
                                            </td>
                                                            <td><small>{review.comment.substring(0, 50)}...</small></td>
                                                            <td>{new Date(review.reviewDate).toLocaleDateString()}</td>
                                                            <td>
                                                                {review.managerReply ? (
                                                                    <span className="badge bg-success">Replied</span>
                                                                ) : (
                                                                    <span className="badge bg-warning text-dark">Pending</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                   
                                    <div className="mt-4 text-center">
                                        <Link to="/reviews" className="btn btn-primary rounded-pill">
                                            Manage Reviews & Respond
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted mb-3">No reviews yet. Guest reviews will appear here once they start booking your hotels.</p>
                                    <p className="text-muted small">Star ratings from reviews will help improve your hotel's visibility!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
           
            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                show={showDeleteConfirm}
                title="Delete Property"
                message="Are you sure you want to delete this property? This action cannot be undone. All associated rooms and bookings will also be affected."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                onConfirm={confirmDeleteHotel}
                onCancel={() => setShowDeleteConfirm(false)}
            />
           
            <Footer />
        </div>
    );
};
 
export default ManagerDashboard;
 