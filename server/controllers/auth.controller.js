import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'your_jwt_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, age, phoneNo } = req.body;

    // Validations
    if (!name || !email || !password || !confirmPassword || !age || !phoneNo) {
      return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'guest',
      age: parseInt(age),
      phoneNo,
    });

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (role && user.role !== role && role !== 'guest') {
      return res.status(403).json({
        success: false,
        message: `You don't have access as ${role}. Your role is ${user.role}`,
      });
    }

    const token = generateToken(user._id, user.role);

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update User Profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, age, phoneNo } = req.body;
    const userId = req.user.id;

    if (!name && !age && !phoneNo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update'
      });
    }

    if (name) {
      const nameRegex = /^[a-zA-Z\s]{2,}$/;
      if (!nameRegex.test(name)) {
        return res.status(400).json({
          success: false,
          message: 'Name must contain only letters and spaces (minimum 2 characters)'
        });
      }
    }

    if (age) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Age must be between 18 and 100'
        });
      }
    }

    if (phoneNo) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phoneNo.replace(/\D/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be 10 digits'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (age) updateData.age = parseInt(age);
    if (phoneNo) updateData.phoneNo = phoneNo;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse,
    });

  } catch (error) {
    console.error('Update profile error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordCorrect = await user.matchPassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      user: userResponse,
    });

  } catch (error) {
    console.error('Change password error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
