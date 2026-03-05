import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import NavBar from "../components/layout/NavBar";
import Footer from "../components/layout/Footer";
import { logout, updateUser } from "../redux/authSlice";
import UserProfile from "../components/features/userDetails/UserProfile";
import UserBookings from "../components/features/userDetails/UserBookings";
import UserLoyalty from "../components/features/userDetails/UserLoyalty";
import { FaUser, FaTrophy, FaCalendar, FaBuilding } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5600';

const UserAccount = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  
  const auth = useSelector((state) => state.auth);
  const currentUser = auth.user;
  const userRole = currentUser?.role || currentUser?.Role || "guest";
  const isAuthenticated = auth.isAuthenticated;
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  // Handle tab query parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'bookings', 'loyalty'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { message: "Please login to view your account" } });
      return;
    }

    if (currentUser) {
      setFormData({
        name: currentUser.name || currentUser.Name || "",
        email: currentUser.email || currentUser.Email || "",
        phone: currentUser.phone || currentUser.ContactNumber || "",
        address: currentUser.address || "",
        city: currentUser.city || "",
        country: currentUser.country || "",
      });
    }

    loadUserData();
  }, [isAuthenticated, currentUser]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Fetch user account data from backend using aggregation
      const response = await fetch(`${API_URL}/api/auth/account-data`, {
        method: 'GET',
        credentials: 'include' // Use cookies for authentication
      });

      // Handle 401 - redirect to login
      if (response.status === 401) {
        console.error("Unauthorized - redirecting to login");
        dispatch(logout());
        navigate("/login", { state: { message: "Session expired. Please login again." } });
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Set bookings from backend
        setBookings(data.data.bookings || []);
        
        // Update form data with backend user data
        if (data.data.user) {
          setFormData({
            name: data.data.user.name || data.data.user.Name || "",
            email: data.data.user.email || data.data.user.Email || "",
            phone: data.data.user.contactNumber || data.data.user.ContactNumber || "",
            address: data.data.user.address || "",
            city: data.data.user.city || "",
            country: data.data.user.country || "",
          });
        }
      } else {
        console.error("Failed to fetch account data:", data.message);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Call backend API to update profile using cookies
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          Name: formData.name,
          ContactNumber: formData.phone,
          Address: formData.address,
          City: formData.city,
          Country: formData.country
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update Redux state with the updated user data from backend
        const updatedUser = {
          ...currentUser,
          name: data.user.Name || formData.name,
          email: data.user.Email || currentUser.email,
          ContactNumber: data.user.ContactNumber || formData.phone,
          address: data.user.Address || formData.address,
          city: data.user.City || formData.city,
          country: data.user.Country || formData.country
        };
        
        dispatch(updateUser(updatedUser));
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        setEditSuccess(true);
        setIsEditMode(false);
        setTimeout(() => setEditSuccess(false), 3000);
        
        // Reload user data to ensure consistency
        loadUserData();
      } else {
        console.error("Failed to update profile:", data.message);
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert('Error saving profile. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const getTabs = () => {
    switch(userRole) {
      case "manager":
        return ["profile"];
      case "admin":
        return ["profile", "users", "hotels"];
      case "guest":
      default:
        return ["profile", "bookings", "loyalty"];
    }
  };

  const availableTabs = getTabs();

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="bg-light min-vh-100 d-flex flex-column">
        <NavBar />
        <div className="container py-5 text-center">
          <h4>Loading...</h4>
          <div className="spinner-border text-primary mt-3"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <NavBar />

      <nav className="bg-white border-bottom py-3 mb-4">
        <div className="container">
          <ol className="breadcrumb mb-0 small">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item active fw-bold text-dark">My Account</li>
          </ol>
        </div>
      </nav>

      <main className="container mb-5 flex-grow-1">
        <div className="row g-4">
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="bg-primary text-white p-4 text-center">
                <div className="fs-1 mb-2">👤</div>
                <h5 className="fw-bold mb-1">{currentUser?.name || 'User'}</h5>
                <p className="small mb-0">{currentUser?.email}</p>
                <span className="badge bg-light text-primary mt-2">{userRole}</span>
              </div>

              <div className="list-group list-group-flush">
                {availableTabs.includes("profile") && (
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`list-group-item list-group-item-action ${activeTab === "profile" ? "active bg-primary border-primary" : ""}`}
                  >
                    <FaUser className="me-2" /> Profile
                  </button>
                )}
                
                {availableTabs.includes("bookings") && (
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className={`list-group-item list-group-item-action ${activeTab === "bookings" ? "active bg-primary border-primary" : ""}`}
                  >
                    <FaCalendar className="me-2" /> My Bookings
                  </button>
                )}
                
                {availableTabs.includes("loyalty") && (
                  <button
                    onClick={() => setActiveTab("loyalty")}
                    className={`list-group-item list-group-item-action ${activeTab === "loyalty" ? "active bg-primary border-primary" : ""}`}
                  >
                    <FaTrophy className="me-2" /> Loyalty Points
                  </button>
                )}

                {availableTabs.includes("users") && (
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`list-group-item list-group-item-action ${activeTab === "users" ? "active bg-primary border-primary" : ""}`}
                  >
                    <FaUser className="me-2" /> User Details
                  </button>
                )}

                {availableTabs.includes("hotels") && (
                  <button
                    onClick={() => setActiveTab("hotels")}
                    className={`list-group-item list-group-item-action ${activeTab === "hotels" ? "active bg-primary border-primary" : ""}`}
                  >
                    <FaBuilding className="me-2" /> Hotel Details
                  </button>
                )}
              </div>

              <div className="p-3 border-top">
                <button 
                  onClick={handleLogout}
                  className="btn btn-outline-danger w-100 rounded-pill"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            {editSuccess && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <strong>Success!</strong> Your profile has been updated.
                <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
              </div>
            )}

            {activeTab === "profile" && (
              <UserProfile 
                currentUser={currentUser}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSaveProfile={handleSaveProfile}
                editSuccess={editSuccess}
                loading={loading}
              />
            )}

            {activeTab === "bookings" && (
              <UserBookings 
                bookings={bookings} 
                loading={loading}
                onBookingCancelled={() => loadUserData()}
              />
            )}

            {activeTab === "loyalty" && (
              <UserLoyalty currentUser={currentUser} />
            )}

            {activeTab === "users" && userRole === "admin" && (
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-4">User Management</h4>
                  <p className="text-muted">Manage system users and their roles.</p>
                </div>
              </div>
            )}

            {activeTab === "hotels" && userRole === "admin" && (
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-4">Hotel Management</h4>
                  <p className="text-muted">Manage hotel properties and their details.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserAccount;

