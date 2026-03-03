import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Protect routes - verify JWT token (from cookie or header)
export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Fallback to Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smart_hotel_booking_system');

      // The JWT contains 'role' (lowercase) from auth.controller.js
      req.user = {
        id: decoded.id,
        role: decoded.role
      };
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Token is not valid' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};
