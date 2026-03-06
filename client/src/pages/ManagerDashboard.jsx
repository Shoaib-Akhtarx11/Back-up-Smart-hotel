import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import Footer from "../components/layout/Footer";
import HotelTable from "../components/features/dashboard/HotelTable";
import RoomTable from "../components/features/dashboard/RoomTable";
import {
  fetchManagerStats,
  fetchManagerHotels,
  fetchManagerRooms,
  fetchManagerBookings,
  fetchManagerReviews,
  deleteManagerHotel,
  deleteManagerRoom,
  updateManagerBookingStatus,
  deleteManagerReview,
  selectManagerStats,
  selectManagerHotels,
  selectManagerRooms,
  selectManagerBookings,
  selectManagerReviews,
  selectManagerLoading,
  selectManagerError,
} from "../redux/managerSlice";
import { FaBuilding, FaBed, FaCalendarCheck, FaStar, FaSignOutAlt, FaChartBar, FaTrash, FaCheck, FaTimes, FaUser, FaPlus } from "react-icons/fa";
import AddRoomForm from "../components/features/manager/AddRoomForm";

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux selectors
  const stats = useSelector(selectManagerStats);
  const hotels = useSelector(selectManagerHotels);
  const rooms = useSelector(selectManagerRooms);
  const bookings = useSelector(selectManagerBookings);
  const reviews = useSelector(selectManagerReviews);
  const loading = useSelector(selectManagerLoading);
  const error = useSelector(selectManagerError);
  const auth = useSelector((state) => state.auth);

  // Get user role
  const userRole = auth.user?.Role || sessionStorage.getItem('userRole');

  // Fetch data on mount
  useEffect(() => {
    if (userRole === 'manager' || userRole === 'admin') {
      loadData();
    }
  }, [dispatch, userRole]);

  // Redirect if not a manager
  useEffect(() => {
    if (userRole && userRole !== 'manager' && userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, navigate]);

  const loadData = () => {
    dispatch(fetchManagerStats());
    dispatch(fetchManagerHotels());
    dispatch(fetchManagerRooms());
    dispatch(fetchManagerBookings());
    dispatch(fetchManagerReviews());
  };

  // Filter helpers
  const filterBySearch = (data, searchFields) => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  };

  // Filtered data
  const filteredHotels = filterBySearch(hotels, ["Name", "Location"]);
  const filteredRooms = filterBySearch(rooms, ["Type", "HotelID"]);
  const filteredBookings = filterBySearch(bookings, ["hotelName", "userName", "userEmail"]);
  const filteredReviews = filterBySearch(reviews, ["hotelName", "userName"]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleDeleteHotel = (hotelId) => {
    if (window.confirm("Are you sure you want to delete this hotel? All rooms and bookings will also be deleted.")) {
      dispatch(deleteManagerHotel(hotelId))
        .then(() => {
          alert("Hotel deleted successfully");
          loadData();
        })
        .catch((err) => {
          alert(err.message || "Failed to delete hotel");
        });
    }
  };

  const handleDeleteRoom = (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      dispatch(deleteManagerRoom(roomId))
        .then(() => {
          alert("Room deleted successfully");
          loadData();
        })
        .catch((err) => {
          alert(err.message || "Failed to delete room");
        });
    }
  };

  const handleApproveBooking = (bookingId) => {
    dispatch(updateManagerBookingStatus({ bookingId, status: "confirmed" }))
      .then(() => {
        alert("Booking approved successfully");
      })
      .catch((err) => {
        alert(err.message || "Failed to approve booking");
      });
  };

  const handleRejectBooking = (bookingId) => {
    if (window.confirm("Are you sure you want to reject this booking?")) {
      dispatch(updateManagerBookingStatus({ bookingId, status: "cancelled" }))
        .then(() => {
          alert("Booking rejected successfully");
        })
        .catch((err) => {
          alert(err.message || "Failed to reject booking");
        });
    }
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      dispatch(deleteManagerReview(reviewId))
        .then(() => {
          alert("Review deleted successfully");
        })
        .catch((err) => {
          alert(err.message || "Failed to delete review");
        });
    }
  };

  const getTabStyle = (tab) => ({
    cursor: "pointer",
    fontWeight: activeTab === tab ? "bold" : "500",
    color: activeTab === tab ? "#0d6efd" : "#6c757d",
    borderBottom: activeTab === tab ? "3px solid #0d6efd" : "3px solid transparent",
  });

  // Dashboard Statistics - API returns stats.hotels.total, stats.bookings.confirmed etc.
  const dashboardStats = stats ? [
    { label: "Total Hotels", value: stats.hotels?.total || stats.totalHotels || 0, color: "primary", icon: <FaBuilding /> },
    { label: "Total Rooms", value: stats.hotels?.rooms || stats.totalRooms || 0, color: "info", icon: <FaBed /> },
    { label: "Total Bookings", value: stats.bookings?.total || stats.totalBookings || 0, color: "success", icon: <FaCalendarCheck /> },
    { label: "Confirmed", value: stats.bookings?.confirmed || stats.confirmedBookings || 0, color: "success", icon: <FaCheck /> },
    { label: "Pending", value: stats.bookings?.pending || stats.pendingBookings || 0, color: "warning", icon: <FaStar /> },
    { label: "Revenue", value: `₹${((stats.revenue?.total || stats.totalRevenue || 0) / 100000).toFixed(1)}L`, color: "warning", icon: <FaChartBar /> },
  ] : [];

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="flex-grow-1" style={{ backgroundColor: "#f8f9fa", paddingTop: "20px", paddingBottom: "40px" }}>
        <div className="container">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-5">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-dark text-white p-3 rounded-3 shadow-sm">
                <FaChartBar size={24} />
              </div>
              <div>
                <h2 className="fw-bold mb-0">Manager Dashboard</h2>
                <p className="text-secondary mb-0">Manage your hotels and monitor bookings</p>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-2" onClick={() => navigate('/')}>
                <FaUser /> Home
              </button>
              <button className="btn btn-danger rounded-pill px-4 d-flex align-items-center gap-2" onClick={handleLogout} title="Logout">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="d-flex gap-4 mb-4 border-bottom overflow-auto pb-2">
            {[
              { id: "dashboard", icon: <FaChartBar />, label: "Dashboard" },
              { id: "hotels", icon: <FaBuilding />, label: "Hotels" },
              { id: "rooms", icon: <FaBed />, label: "Rooms" },
              { id: "bookings", icon: <FaCalendarCheck />, label: "Bookings" },
              { id: "reviews", icon: <FaStar />, label: "Reviews" },
            ].map((tab) => (
              <div
                key={tab.id}
                className="pb-2 px-1 tab-button d-flex align-items-center gap-2"
                style={getTabStyle(tab.id)}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm("");
                }}
              >
                {tab.icon}
                {tab.label}
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

          {/* Content */}
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              {loading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {!loading && activeTab === "dashboard" && (
                <>
                  <h4 className="fw-bold mb-4">Dashboard Overview</h4>
                  <div className="row g-3">
                    {dashboardStats.map((stat, idx) => (
                      <div key={idx} className="col-md-6 col-lg-4">
                        <div className={`card border-0 shadow-sm rounded-4 bg-${stat.color} text-white`}>
                          <div className="card-body p-4 text-center">
                            <div className="mb-2">{stat.icon}</div>
                            <h3 className="fw-bold mb-1">{stat.value}</h3>
                            <p className="mb-0 opacity-75 small">{stat.label}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {!loading && activeTab === "hotels" && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">My Hotels ({filteredHotels.length})</h4>
                    <button className="btn btn-primary" onClick={() => navigate('/add-hotel')}>
                      <FaBuilding className="me-2" /> Add Hotel
                    </button>
                  </div>
                  <HotelTable hotels={filteredHotels} onDelete={handleDeleteHotel} isManager={true} />
                </>
              )}

              {!loading && activeTab === "rooms" && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">My Rooms ({filteredRooms.length})</h4>
                    <button className="btn btn-primary" onClick={() => setShowAddRoomModal(true)}>
                      <FaPlus className="me-2" /> Add Room
                    </button>
                  </div>
                  <RoomTable 
                    rooms={filteredRooms} 
                    onDelete={handleDeleteRoom} 
                    managerHotels={hotels}
                  />
                </>
              )}

              {!loading && activeTab === "bookings" && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Hotel Bookings ({filteredBookings.length})</h4>
                  </div>
                  {filteredBookings.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Hotel</th>
                            <th>Guest</th>
                            <th>Room</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Status</th>
                            <th className="text-end pe-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBookings.map((booking) => {
                            const statusColors = {
                              confirmed: "success",
                              pending: "warning",
                              cancelled: "danger",
                              completed: "info",
                            };
                            const statusColor = statusColors[booking.Status?.toLowerCase()] || "secondary";

                            return (
                              <tr key={booking._id}>
                                <td className="fw-bold">{booking.hotelName || booking.RoomID?.HotelID?.Name || 'N/A'}</td>
                                <td>
                                  <div className="fw-bold">{booking.userName || booking.UserID?.Name || 'Guest'}</div>
                                  <div className="small text-muted">{booking.userEmail || booking.UserID?.Email || ''}</div>
                                </td>
                                <td>{booking.roomType || booking.RoomID?.Type || 'N/A'}</td>
                                <td className="small">
                                  {booking.CheckInDate ? new Date(booking.CheckInDate).toLocaleDateString() : "N/A"}
                                </td>
                                <td className="small">
                                  {booking.CheckOutDate ? new Date(booking.CheckOutDate).toLocaleDateString() : "N/A"}
                                </td>
                                <td>
                                  <span className={`badge bg-${statusColor}`}>{booking.Status}</span>
                                </td>
                                <td className="text-end pe-3">
                                  <div className="btn-group btn-group-sm" role="group">
                                    <button
                                      className="btn btn-outline-success"
                                      onClick={() => handleApproveBooking(booking._id)}
                                      disabled={booking.Status === "confirmed"}
                                      title="Approve"
                                    >
                                      <FaCheck />
                                    </button>
                                    <button
                                      className="btn btn-outline-danger"
                                      onClick={() => handleRejectBooking(booking._id)}
                                      disabled={booking.Status === "cancelled"}
                                      title="Reject"
                                    >
                                      <FaTimes />
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

              {!loading && activeTab === "reviews" && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Hotel Reviews ({filteredReviews.length})</h4>
                  </div>
                  {filteredReviews.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Hotel</th>
                            <th>User</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>Date</th>
                            <th className="text-end pe-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReviews.map((review) => (
                            <tr key={review._id}>
                              <td className="fw-bold">{review.hotelName || 'N/A'}</td>
                              <td>{review.userName || review.UserID?.Name || 'Anonymous'}</td>
                              <td>
                                <span className="badge bg-warning text-dark">
                                  {"★".repeat(review.rating || 0)} {review.rating || 0}
                                </span>
                              </td>
                              <td className="text-muted small" style={{ maxWidth: "300px" }}>
                                {review.comment?.substring(0, 80) || "No comment"}...
                              </td>
                              <td className="text-muted small">
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "N/A"}
                              </td>
                              <td className="text-end pe-3">
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteReview(review._id)}
                                  title="Delete review"
                                >
                                  <FaTrash />
                                </button>
                              </td>
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

          {/* Add Room Modal */}
          {showAddRoomModal && (
            <AddRoomForm 
              hotels={hotels} 
              onClose={() => setShowAddRoomModal(false)}
              onSuccess={() => {
                setShowAddRoomModal(false);
                loadData();
              }}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ManagerDashboard;

