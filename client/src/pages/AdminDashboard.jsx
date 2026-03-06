import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import Footer from "../components/layout/Footer";
import UserManagementTable from "../components/features/dashboard/UserManagementTable";
import HotelTable from "../components/features/dashboard/HotelTable";
import {
  fetchDashboardStats,
  fetchAdminUsers,
  fetchAdminHotels,
  fetchAdminBookings,
  fetchMostBookedHotels,
  fetchAdminReviews,
  deleteUser,
  deleteHotel,
  updateAdminBookingStatus,
  updateUserRole,
  deleteReview,
  selectAdminStats,
  selectAdminUsers,
  selectAdminHotels,
  selectAdminBookings,
  selectMostBookedHotels,
  selectAdminReviews,
  selectAdminLoading,
  selectAdminError,
} from "../redux/adminSlice";
import { FaUsers, FaUserTie, FaHotel, FaStar, FaSignOutAlt, FaChartBar, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux selectors
  const stats = useSelector(selectAdminStats);
  const users = useSelector(selectAdminUsers);
  const hotels = useSelector(selectAdminHotels);
  const bookings = useSelector(selectAdminBookings);
  const mostBookedHotels = useSelector(selectMostBookedHotels);
  const reviews = useSelector(selectAdminReviews);
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);
  const auth = useSelector((state) => state.auth);

  // Fetch data on mount
  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAdminUsers());
    dispatch(fetchAdminHotels());
    dispatch(fetchAdminBookings());
    dispatch(fetchMostBookedHotels());
    dispatch(fetchAdminReviews());
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
  const customers = users.filter((u) => u.Role === "guest" || u.Role === "user");
  const managers = users.filter((u) => u.Role === "manager");
  const admins = users.filter((u) => u.Role === "admin");

  const filteredCustomers = filterBySearch(customers, ["Name", "Email"]);
  const filteredManagers = filterBySearch(managers, ["Name", "Email"]);
  const filteredHotels = filterBySearch(hotels, ["Name", "Location"]);
  const filteredBookings = filterBySearch(bookings, ["hotelName", "userName", "userEmail", "bookingID"]);
  const filteredReviews = filterBySearch(reviews, ["hotelName", "userName"]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      dispatch(deleteUser(userId))
        .then(() => {
          alert("User deleted successfully");
        })
        .catch((err) => {
          alert(err.message || "Failed to delete user");
        });
    }
  };

  const handleDeleteHotel = (hotelId) => {
    if (window.confirm("Are you sure you want to delete this hotel? All rooms and bookings will also be deleted.")) {
      dispatch(deleteHotel(hotelId))
        .then(() => {
          alert("Hotel deleted successfully");
        })
        .catch((err) => {
          alert(err.message || "Failed to delete hotel");
        });
    }
  };

  const handleApproveBooking = (bookingId) => {
    dispatch(updateAdminBookingStatus({ bookingId, status: "confirmed" }))
      .then(() => {
        alert("Booking approved successfully");
      })
      .catch((err) => {
        alert(err.message || "Failed to approve booking");
      });
  };

  const handleRejectBooking = (bookingId) => {
    if (window.confirm("Are you sure you want to reject this booking?")) {
      dispatch(updateAdminBookingStatus({ bookingId, status: "cancelled" }))
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
      dispatch(deleteReview(reviewId))
        .then(() => {
          alert("Review deleted successfully");
        })
        .catch((err) => {
          alert(err.message || "Failed to delete review");
        });
    }
  };

  const handleRoleChange = (userId, newRole) => {
    dispatch(updateUserRole({ userId, role: newRole }))
      .then(() => {
        alert("User role updated successfully");
      })
      .catch((err) => {
        alert(err.message || "Failed to update role");
      });
  };

  const getTabStyle = (tab) => ({
    cursor: "pointer",
    fontWeight: activeTab === tab ? "bold" : "500",
    color: activeTab === tab ? "#0d6efd" : "#6c757d",
    borderBottom: activeTab === tab ? "3px solid #0d6efd" : "3px solid transparent",
  });

  // Dashboard Statistics
  const dashboardStats = stats ? [
    { label: "Total Users", value: stats.users?.total || 0, color: "primary", icon: <FaUsers /> },
    { label: "Guests", value: stats.users?.guests || 0, color: "info", icon: <FaUserTie /> },
    { label: "Managers", value: stats.users?.managers || 0, color: "warning", icon: <FaUserTie /> },
    { label: "Total Hotels", value: stats.hotels?.total || 0, color: "success", icon: <FaHotel /> },
    { label: "Total Rooms", value: stats.hotels?.rooms || 0, color: "secondary", icon: <FaHotel /> },
    { label: "Total Bookings", value: stats.bookings?.total || 0, color: "primary", icon: <FaStar /> },
    { label: "Confirmed", value: stats.bookings?.confirmed || 0, color: "success", icon: <FaCheck /> },
    { label: "Revenue", value: `₹${((stats.revenue?.total || 0) / 100000).toFixed(1)}L`, color: "warning", icon: <FaChartBar /> },
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
                <h2 className="fw-bold mb-0">Admin Central Command</h2>
                <p className="text-secondary mb-0">Global oversight of users and property listings</p>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-danger rounded-pill px-4 d-flex align-items-center gap-2" onClick={handleLogout} title="Logout">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="d-flex gap-4 mb-4 border-bottom overflow-auto pb-2">
            {[
              { id: "dashboard", icon: <FaChartBar />, label: "Dashboard" },
              { id: "customers", icon: <FaUsers />, label: "Customers" },
              { id: "managers", icon: <FaUserTie />, label: "Managers" },
              { id: "admins", icon: <FaStar />, label: "Admins" },
              { id: "hotels", icon: <FaHotel />, label: "Hotels" },
              { id: "bookings", icon: <FaStar />, label: "Bookings" },
              { id: "reviews", icon: <FaStar />, label: "Reviews" },
              { id: "analytics", icon: <FaChartBar />, label: "Most Booked" },
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
                      <div key={idx} className="col-md-6 col-lg-3">
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

              {!loading && activeTab === "customers" && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Registered Customers ({filteredCustomers.length})</h4>
                  </div>
                  <UserManagementTable
                    users={filteredCustomers}
                    type="customer"
                    onDelete={handleDeleteUser}
                    onRoleChange={handleRoleChange}
                  />
                </>
              )}

              {!loading && activeTab === "managers" && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Hotel Managers ({filteredManagers.length})</h4>
                  </div>
                  <UserManagementTable
                    users={filteredManagers}
                    type="manager"
                    onDelete={handleDeleteUser}
                    onRoleChange={handleRoleChange}
                  />
                </>
              )}

              {!loading && activeTab === "admins" && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">System Administrators ({filteredManagers.length})</h4>
                  </div>
                  <UserManagementTable
                    users={admins}
                    type="admin"
                    onDelete={handleDeleteUser}
                    onRoleChange={handleRoleChange}
                  />
                </>
              )}

              {!loading && activeTab === "hotels" && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Property Listings ({filteredHotels.length})</h4>
                  </div>
                  <HotelTable hotels={filteredHotels} onDelete={handleDeleteHotel} isAdmin={true} />
                </>
              )}

              {!loading && activeTab === "bookings" && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">All Bookings ({filteredBookings.length})</h4>
                  </div>
                  {filteredBookings.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Booking ID</th>
                            <th>Guest</th>
                            <th>Hotel</th>
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
                            const statusColor = statusColors[booking.status?.toLowerCase()] || "secondary";

                            return (
                              <tr key={booking._id}>
                                <td className="fw-bold">#{booking.bookingID || booking._id?.slice(-6)}</td>
                                <td>
                                  <div className="fw-bold">{booking.userName}</div>
                                  <div className="small text-muted">{booking.userEmail}</div>
                                </td>
                                <td>
                                  <div className="fw-bold">{booking.hotelName}</div>
                                  <div className="small text-muted">{booking.hotelLocation}</div>
                                </td>
                                <td>{booking.roomType}</td>
                                <td className="small">
                                  {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : "N/A"}
                                </td>
                                <td className="small">
                                  {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : "N/A"}
                                </td>
                                <td>
                                  <span className={`badge bg-${statusColor}`}>{booking.status}</span>
                                </td>
                                <td className="text-end pe-3">
                                  <div className="btn-group btn-group-sm" role="group">
                                    <button
                                      className="btn btn-outline-success"
                                      onClick={() => handleApproveBooking(booking._id)}
                                      disabled={booking.status === "confirmed"}
                                      title="Approve"
                                    >
                                      <FaCheck />
                                    </button>
                                    <button
                                      className="btn btn-outline-danger"
                                      onClick={() => handleRejectBooking(booking._id)}
                                      disabled={booking.status === "cancelled"}
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
                              <td className="fw-bold">{review.hotelName}</td>
                              <td>{review.userName}</td>
                              <td>
                                <span className="badge bg-warning text-dark">
                                  {"★".repeat(review.rating || 0)} {review.rating || 0}
                                </span>
                              </td>
                              <td className="text-muted small" style={{ maxWidth: "300px" }}>
                                {review.comment?.substring(0, 80) || "No comment"}...
                              </td>
                              <td className="text-muted small">
                                {review.date ? new Date(review.date).toLocaleDateString() : "N/A"}
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

              {!loading && activeTab === "analytics" && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Most Booked Hotels ({mostBookedHotels.length})</h4>
                  </div>
                  {mostBookedHotels.length > 0 ? (
                    <div className="row g-4">
                      {mostBookedHotels.map((hotel, idx) => (
                        <div key={hotel._id} className="col-md-6 col-lg-4">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="position-absolute top-0 end-0 m-2">
                              <span className="badge bg-primary fs-6">#{idx + 1}</span>
                            </div>
                            <img
                              src={hotel.hotelImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"}
                              className="card-img-top"
                              alt={hotel.hotelName}
                              style={{ height: "150px", objectFit: "cover" }}
                            />
                            <div className="card-body">
                              <h5 className="card-title fw-bold">{hotel.hotelName}</h5>
                              <p className="text-muted small mb-3">
                                <i className="bi bi-geo-alt me-1"></i>
                                {hotel.hotelLocation}
                              </p>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-primary fw-bold">{hotel.totalBookings} Bookings</span>
                                <span className="text-success fw-bold">
                                  ₹{hotel.totalRevenue?.toLocaleString() || 0}
                                </span>
                              </div>
                              <div className="d-flex gap-2 small text-muted">
                                <span>
                                  <FaCheck className="text-success me-1" />
                                  {hotel.confirmedBookings} confirmed
                                </span>
                                <span>
                                  <FaTimes className="text-danger me-1" />
                                  {hotel.cancelledBookings} cancelled
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">No booking analytics available yet</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;

