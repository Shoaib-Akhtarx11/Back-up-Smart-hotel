import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Page Imports
import Home from "./pages/Home";
import HotelList from "./pages/HotelList";
import HotelDetails from "./pages/HotelDetails";
import BookingPage from "./pages/BookingPage";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReviewDashboard from "./pages/AdminReviewDashboard";
import AddHotel from "./pages/AddHotel";
import ReviewManagement from "./pages/ReviewManagement";
import LoyaltyPage from "./pages/LoyaltyPage";
import RecentVisit from "./pages/RecentVisit";
import UserAccount from "./pages/UserAccount";
import Error from "./pages/Error";

// Auth Component Imports
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

/**
 * App Component
 * Handles the global routing configuration for the application.
 */
const App = () => {
  const navigate = useNavigate();

  return (
    <ErrorBoundary>
      <div className="app-wrapper">
        <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/hotelList" element={<HotelList />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />

        {/* --- Booking Flow (Requires Hotel ID and Room ID) --- */}
        <Route path="/booking/:hotelId/:roomId" element={<BookingPage />} />

        {/* --- User Account & Loyalty --- */}
        <Route path="/account" element={<UserAccount />} />
        <Route path="/loyalty" element={<LoyaltyPage />} />
        <Route path="/recentvisit" element={<RecentVisit />} />

        {/* --- Dashboards (Role-Based) --- */}
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/add-hotel" element={<AddHotel />} />
        <Route path="/reviews" element={<ReviewManagement />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/reviews" element={<AdminReviewDashboard />} />

        {/* --- Authentication Routes --- */}
        <Route
          path="/login"
          element={
            <Login
              onSuccess={() => navigate("/")}
              onSwitchToRegister={() => navigate("/register")}
            />
          }
        />
        <Route
          path="/register"
          element={
            <Register
              onSwitchToLogin={() => navigate("/login")}
            />
          }
        />

        {/* --- Error Handling Routes --- */}
        {/* Route for specific errors (e.g., booking failures) */}
        <Route path="/error" element={<Error />} />

        {/* Catch-all route for 404 - Page Not Found */}
        <Route 
          path="*" 
          element={<Error message="The page you are looking for does not exist." />} 
        />
        </Routes>
      </div>
    </ErrorBoundary>
  );
};

export default App;