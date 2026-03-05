import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // FIX: Normalize role to lowercase for consistent comparison
  // User model uses 'Role' (capital R), but we normalize to lowercase
  const role = (user?.Role || user?.role || 'guest').toLowerCase();

  try {
    // 1. Show nothing (or a spinner) while checking auth status
    if (loading) {
      return (
        <div className="vh-100 d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      );
    }

    // 2. If not logged in, send to login page
    // We save the 'referrer' location so we can send them back after they login
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. If logged in but doesn't have the right role (e.g., Guest trying to see Admin)
    // Normalize allowed roles to lowercase
    const normalizedAllowedRoles = allowedRoles?.map(r => r.toLowerCase()) || [];
    if (allowedRoles && !normalizedAllowedRoles.includes(role)) {
      return (
        <Navigate
          to="/error"
          state={{ message: "You do not have permission to view this page." }}
          replace
        />
      );
    }

    // 4. Everything is fine, show the page
    return children;
  } catch (error) {
    console.error("Auth Guard Error:", error);
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
