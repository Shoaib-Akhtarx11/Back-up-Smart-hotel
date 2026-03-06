import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Protect routes - verify JWT token (from cookie or header)
export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('[Auth] Token found in cookie');
    }
    // Fallback to Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('[Auth] Token found in Authorization header');
    }

    // Make sure token exists
    if (!token) {
      console.log('[Auth] No token found in request');
      return res.status(401).json({ success: false, message: 'Not authorized to access this route - No token provided' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smart_hotel_booking_system');
      console.log('[Auth] Token decoded, user ID:', decoded.id);

      // Fetch user to get the actual role (handle both 'Role' from DB and 'role' from token)
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('[Auth] User not found for ID:', decoded.id);
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      console.log('[Auth] User found, Role:', user.Role);
      
      // Use the role from database (capital R) and normalize to lowercase for consistency
      // The User model uses 'Role' (capital R), so we normalize it to lowercase
      req.user = {
        id: decoded.id,
        role: (user.Role || decoded.role || 'guest').toLowerCase()
      };
      console.log('[Auth] Request user set:', req.user);
      next();
    } catch (err) {
      console.log('[Auth] Token verification failed:', err.message);
      return res.status(401).json({ success: false, message: 'Token is not valid' });
    }
  } catch (error) {
    console.error('[Auth] Protect middleware error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Authorize specific roles - roles should be lowercase
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Normalize role to lowercase for comparison
    const userRole = (req.user.role || '').toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());
    
    console.log('[Auth] Authorize check - User role:', userRole, 'Allowed roles:', allowedRoles);
    
    if (!allowedRoles.includes(userRole)) {
      console.log('[Auth] Authorization failed - role not allowed');
      return res.status(403).json({
        success: false,
        message: `User role '${userRole}' is not authorized to access this route`,
      });
    }
    console.log('[Auth] Authorization passed');
    next();
  };
};
