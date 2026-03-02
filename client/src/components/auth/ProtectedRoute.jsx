import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useSelector((state) => state.auth);
  const location = useLocation();

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
    if (allowedRoles && !allowedRoles.includes(role)) {
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
