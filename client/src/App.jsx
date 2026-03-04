import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";

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
import RecentVisit from "./pages/RecentVisit";
import UserAccount from "./pages/UserAccount";
import BookingSuccess from "./pages/BookingSuccess";
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
        <Route path="/booking-success" element={<BookingSuccess />} />

        {/* --- User Account & Loyalty --- */}
        <Route path="/account" element={
          <ProtectedRoute allowedRoles={['guest', 'manager', 'admin']}>
            <UserAccount />
          </ProtectedRoute>
        } />
        <Route path="/recentvisit" element={
          <ProtectedRoute allowedRoles={['guest', 'manager', 'admin']}>
            <RecentVisit />
          </ProtectedRoute>
        } />

        {/* --- Dashboards (Role-Based) --- */}
        {/* Manager Dashboard - Only managers and admins can access */}
        <Route path="/manager" element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <ManagerDashboard />
          </ProtectedRoute>
        } />
        
        {/* Add Hotel - Only managers and admins can access */}
        <Route path="/add-hotel" element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <AddHotel />
          </ProtectedRoute>
        } />
        
        {/* Review Management - Only managers and admins can access */}
        <Route path="/reviews" element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <ReviewManagement />
          </ProtectedRoute>
        } />
        
        {/* Admin Dashboard - Only admins can access */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Admin Review Dashboard - Only admins can access */}
        <Route path="/admin/reviews" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminReviewDashboard />
          </ProtectedRoute>
        } />

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