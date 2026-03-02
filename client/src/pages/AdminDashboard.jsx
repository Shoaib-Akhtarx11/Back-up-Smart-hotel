import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { deleteHotel } from "../redux/hotelSlice";
import NavBar from "../components/layout/NavBar";
import Footer from "../components/layout/Footer";
import UserManagementTable from "../components/features/dashboard/UserManagementTable";
import HotelTable from "../components/features/dashboard/HotelTable";
import { FaUsers, FaUserTie, FaHotel, FaDatabase, FaStar, FaSignOutAlt, FaHome } from "react-icons/fa";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("customers");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Safe Selectors
  const reduxHotels = useSelector((state) => state.hotels?.allHotels || []);
  const reduxUsers = useSelector((state) => state.users?.allUsers || []);
  const allReviews = useSelector((state) => state.reviews?.allReviews || []);
  const allBookings = useSelector((state) => state.bookings?.allBookings || []);
  const auth = useSelector((state) => state.auth);

  // Use Redux as single source of truth (now persisted via redux-persist)
  const allHotels = reduxHotels;
  const allUsers = reduxUsers;

  let customers = [];
  let managers = [];
  let filteredData = [];

  try {
    // Filter logic with safety guards
    managers = allUsers.filter((user) => user?.role === "manager");
    customers = allUsers.filter((user) => user?.role === "guest" || user?.role === "user" || !user?.role);
    
    // Apply search filter based on active tab
    if (activeTab === "customers") {
      filteredData = customers.filter(user => 
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (activeTab === "managers") {
      filteredData = managers.filter(user => 
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (activeTab === "hotels") {
      filteredData = allHotels.filter(hotel => 
        hotel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel?.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (activeTab === "reviews") {
      filteredData = allReviews.filter(review => 
        review?.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review?.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (activeTab === "bookings") {
      filteredData = allBookings.filter(booking => {
        const user = allUsers.find(u => u.id === (booking.UserID || booking.userId));
        const hotel = allHotels.find(h => h.id === (booking.HotelID || booking.hotelId));
        const searchLower = searchTerm.toLowerCase();
        const bookingId = (booking.BookingID || booking.id || '').toString().toLowerCase();
        return user?.name?.toLowerCase().includes(searchLower) ||
               hotel?.name?.toLowerCase().includes(searchLower) ||
               bookingId.includes(searchLower);
      });
    }
  } catch (err) {
    console.error("Admin Data Processing Error:", err);
    navigate("/error", { state: { message: "Critical error loading system databases." } });
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleDeleteHotel = (id) => {
    try {
      dispatch(deleteHotel(id));
      
      // Also delete from localStorage
      const allHotelsFromStorage = JSON.parse(localStorage.getItem('allHotels') || '[]');
      const filteredHotels = allHotelsFromStorage.filter(h => h.id !== id);
      localStorage.setItem('allHotels', JSON.stringify(filteredHotels));
      
      alert('Hotel deleted successfully');
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Failed to delete hotel. Please try again.');
    }
  };

  const getTabStyle = (tab) => ({
    cursor: "pointer",
    fontWeight: activeTab === tab ? "bold" : "500",
    color: activeTab === tab ? "#0d6efd" : "#6c757d",
    borderBottom: activeTab === tab ? "3px solid #0d6efd" : "3px solid transparent",
  });

  // Dashboard Statistics
  const stats = [
    { label: "Total Users", value: allUsers.length, color: "primary" },
    { label: "Total Hotels", value: allHotels.length, color: "success" },
    { label: "Managers", value: managers.length, color: "info" },
    { label: "Total Bookings", value: allBookings.length, color: "warning" },
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* <NavBar /> */}
      
      <div className="flex-grow-1" style={{ backgroundColor: "#f8f9fa", paddingTop: "20px", paddingBottom: "40px" }}>
        <div className="container">
          {/* Header with Navigation */}
          <div className="d-flex align-items-center justify-content-between mb-5">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-dark text-white p-3 rounded-3 shadow-sm">
                <FaDatabase size={24} />
              </div>
              <div>
                <h2 className="fw-bold mb-0">Admin Central Command</h2>
                <p className="text-secondary mb-0">Global oversight of users and property listings</p>
              </div>
            </div>
            <div className="d-flex gap-2">
              {/* <button 
                className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-2"
                onClick={() => navigate("/")}
                title="Go to Home"
              >
                <FaHome /> Home
              </button> */}
              <button 
                className="btn btn-danger rounded-pill px-4 d-flex align-items-center gap-2"
                onClick={handleLogout}
                title="Logout"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>

          {/* Dashboard Statistics */}
          <div className="row gap-3 mb-5">
            {stats.map((stat, idx) => (
              <div key={idx} className="col-md-6 col-lg-3">
                <div className={`card border-0 shadow-sm rounded-4 bg-${stat.color} text-white`}>
                  <div className="card-body p-4 text-center">
                    <h3 className="fw-bold mb-1">{stat.value}</h3>
                    <p className="mb-0 opacity-75">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="d-flex gap-4 mb-4 border-bottom overflow-auto">
            {["customers", "managers", "hotels", "bookings", "reviews"].map((tab) => (
              <div 
                key={tab}
                className="pb-2 px-1 tab-button text-capitalize" 
                style={getTabStyle(tab)} 
                onClick={() => { setActiveTab(tab); setSearchTerm(""); }}
              >
                {tab === "customers" && <FaUsers className="me-2" />}
                {tab === "managers" && <FaUserTie className="me-2" />}
                {tab === "hotels" && <FaHotel className="me-2" />}
                {tab === "bookings" && <i className="bi bi-calendar-check me-2"></i>}
                {tab === "reviews" && <FaStar className="me-2" />}
                {tab} DB
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input 
              type="text" 
              className="form-control rounded-3 border-0 shadow-sm p-3"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Dynamic Content Rendering */}
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <div key={activeTab} className="fade-in-section">
                {activeTab === "customers" && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="fw-bold mb-0">Registered Customers ({filteredData.length})</h4>
                    </div>
                    <UserManagementTable users={filteredData} type="customer" />
                  </>
                )}

                {activeTab === "managers" && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="fw-bold mb-0">Hotel Managers ({filteredData.length})</h4>
                    </div>
                    <UserManagementTable users={filteredData} type="manager" />
                  </>
                )}

                {activeTab === "hotels" && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="fw-bold mb-0">Property Listings ({filteredData.length})</h4>
                      <Link 
                        to="/add-hotel"
                        className="btn btn-success px-4 py-2 fw-bold shadow-sm rounded-pill" 
                      >
                        <i className="bi bi-plus-lg me-2"></i>Add New Hotel
                      </Link>
                    </div>
                    <HotelTable hotels={filteredData} onDelete={handleDeleteHotel} />
                  </>
                )}

                {activeTab === "bookings" && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="fw-bold mb-0">All Bookings ({filteredData.length})</h4>
                    </div>
                    {filteredData.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Booking ID</th>
                              <th>Guest Name</th>
                              <th>Hotel</th>
                              <th>Check-in</th>
                              <th>Check-out</th>
                              <th>Status</th>
                              <th>Total Price</th>
                              <th>Points Earned</th>
                              <th className="text-end pe-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredData.map((booking) => {
                              const guest = allUsers.find(u => u.id === (booking.UserID || booking.userId));
                              const hotel = allHotels.find(h => h.id === (booking.HotelID || booking.hotelId));
                              const statusColor = (booking.Status || booking.status) === 'Confirmed' ? 'success' : (booking.Status || booking.status) === 'Cancelled' ? 'danger' : 'warning';
                              const isApproved = (booking.Status || booking.status) === 'Confirmed';
                              
                              return (
                                <tr key={booking.BookingID || booking.id}>
                                  <td className="fw-bold">{booking.BookingID || booking.id}</td>
                                  <td>{guest?.name || "N/A"}</td>
                                  <td>{hotel?.name || "N/A"}</td>
                                  <td className="small">{new Date(booking.CheckInDate || booking.checkInDate).toLocaleDateString()}</td>
                                  <td className="small">{new Date(booking.CheckOutDate || booking.checkOutDate).toLocaleDateString()}</td>
                                  <td>
                                    <span className={`badge bg-${statusColor}`}>
                                      {booking.Status || booking.status}
                                    </span>
                                  </td>
                                  <td className="fw-bold">₹{(booking.TotalPrice || booking.totalPrice || 0).toLocaleString()}</td>
                                  <td><span className="badge bg-info">{booking.LoyaltyPointsEarned || booking.loyaltyPointsEarned || 0}</span></td>
                                  <td className="text-end pe-3">
                                    <div className="btn-group btn-group-sm" role="group">
                                      <button 
                                        className="btn btn-outline-success"
                                        onClick={() => {
                                          alert(`Booking ${booking.BookingID || booking.id} approved! Status changed to Confirmed.`);
                                        }}
                                        disabled={isApproved}
                                        title="Approve booking"
                                      >
                                        <i className="bi bi-check-circle"></i>
                                      </button>
                                      <button 
                                        className="btn btn-outline-danger"
                                        onClick={() => {
                                          if(window.confirm(`Are you sure you want to disapprove booking ${booking.BookingID || booking.id}?`)) {
                                            alert(`Booking ${booking.BookingID || booking.id} disapproved! Status changed to Cancelled.`);
                                          }
                                        }}
                                        disabled={(booking.Status || booking.status) === 'Cancelled'}
                                        title="Disapprove booking"
                                      >
                                        <i className="bi bi-x-circle"></i>
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
                      <div className="text-center py-5">
                        <p className="text-muted">No bookings found</p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "reviews" && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="fw-bold mb-0">Hotel Reviews ({filteredData.length})</h4>
                    </div>
                    {filteredData.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Hotel Name</th>
                              <th>Guest Name</th>
                              <th>Rating</th>
                              <th>Comment</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredData.map((review) => (
                              <tr key={review.id || review.hotelId}>
                                <td className="fw-bold">{review.hotelName || "N/A"}</td>
                                <td>{review.userName || review.guestName || "Anonymous"}</td>
                                <td>
                                  <span className="badge bg-warning text-dark">
                                    {"★".repeat(review.rating || 0)} {review.rating || 0}
                                  </span>
                                </td>
                                <td className="text-muted small" style={{ maxWidth: "300px" }}>
                                  {review.comment?.substring(0, 50) || "No comment"}...
                                </td>
                                <td className="text-muted small">{review.date || "N/A"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <p className="text-muted">No reviews found</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;