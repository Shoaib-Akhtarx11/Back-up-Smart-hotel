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

      // Fetch user to get the actual role (handle both 'Role' from DB and 'role' from token)
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Use the role from database (capital R) and normalize to lowercase for consistency
      // The User model uses 'Role' (capital R), so we normalize it to lowercase
      req.user = {
        id: decoded.id,
        role: (user.Role || decoded.role || 'guest').toLowerCase()
      };
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Token is not valid' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Authorize specific roles - roles should be lowercase
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Normalize role to lowercase for comparison
    const userRole = (req.user.role || '').toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${userRole}' is not authorized to access this route`,
      });
    }
    next();
  };
};
