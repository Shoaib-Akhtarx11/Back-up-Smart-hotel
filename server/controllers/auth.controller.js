import User from '../models/user.model.js';
import Booking from '../models/booking.model.js';
import Manager from '../models/manager.model.js';
import Hotel from '../models/hotel.model.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'smart_hotel_booking_system', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { Name, Email, Password, ConfirmPassword, Role, ContactNumber, HotelID } = req.body;

    // Validations
    if (!Name || !Email || !Password || !ConfirmPassword || !ContactNumber) {
      return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }

    if (Password !== ConfirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (Password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // If registering as manager, HotelID is required
    if (Role === 'manager' && !HotelID) {
      return res.status(400).json({
        success: false,
        message: 'HotelID is required for manager registration'
      });
    }

    // Check if user already exists
    const normalized = Email.toLowerCase();
    let user = await User.findOne({ $or: [{ Email: normalized }, { email: normalized }] });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user (write both PascalCase and lowercase fields to keep the
    // old unique index satisfied and support any legacy queries)
    const normalizedEmail = Email.toLowerCase();
    user = await User.create({
      Name,
      Email: normalizedEmail,
      email: normalizedEmail, // legacy field
      Password,
      Role: Role || 'guest',
      ContactNumber,
    });

    // If registering as manager, create manager profile
    if (Role === 'manager' && HotelID) {
      try {
        // Check if hotel exists
        const hotel = await Hotel.findById(HotelID);
        if (!hotel) {
          // User was created, but hotel not found - return success with warning
          console.warn(`Hotel not found with ID: ${HotelID}`);
        } else {
          // Check if hotel already has a manager
          const existingHotelManager = await Manager.findOne({ HotelID });
          if (existingHotelManager) {
            console.warn(`Hotel already has a manager assigned`);
          } else {
            // Create manager profile
            await Manager.create({
              ManagerID: user._id,
              HotelID,
              DateAssigned: Date.now(),
              Status: 'active'
            });

            // Update hotel's ManagerID
            hotel.ManagerID = user._id;
            await hotel.save();
          }
        }
      } catch (managerError) {
        console.error('Error creating manager profile:', managerError);
        // Continue with registration even if manager profile creation fails
      }
    }

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.Password;

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
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const lower = Email.toLowerCase();
    // search either current or legacy field in case some docs still use it
    const user = await User.findOne({ $or: [{ Email: lower }, { email: lower }] }).select('+Password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await user.matchPassword(Password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.Role);

    // Send token as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    const userResponse = user.toObject();
    delete userResponse.Password;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token, // Also send token in body for localStorage
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-Password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Private (admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-Password');
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update User Profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { Name, ContactNumber, Address, City, Country, DateOfBirth } = req.body;
    const userId = req.user.id;

    if (!Name && !ContactNumber && !Address && !City && !Country && !DateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update'
      });
    }

    if (Name) {
      const nameRegex = /^[a-zA-Z\s]{2,}$/;
      if (!nameRegex.test(Name)) {
        return res.status(400).json({
          success: false,
          message: 'Name must contain only letters and spaces (minimum 2 characters)'
        });
      }
    }

    if (ContactNumber) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(ContactNumber.replace(/\D/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Contact number must be 10 digits'
        });
      }
    }

    const updateData = {};
    if (Name) updateData.Name = Name;
    if (ContactNumber) updateData.ContactNumber = ContactNumber;
    if (Address !== undefined) updateData.Address = Address;
    if (City) updateData.City = City;
    if (Country) updateData.Country = Country;
    if (DateOfBirth) updateData.DateOfBirth = DateOfBirth;

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
    delete userResponse.Password;

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

    const user = await User.findById(userId).select('+Password');

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

    user.Password = newPassword;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.Password;

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

// @desc    Get user account data with bookings using aggregation
// @route   GET /api/auth/account-data
// @access  Private
export const getUserAccountData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Convert userId to MongoDB ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);

    // Use aggregation to get user profile and bookings with room and hotel details
    const accountData = await User.aggregate([
      // Stage 1: Match the user by ID
      {
        $match: { _id: objectId }
      },
      // Stage 2: Project user fields (exclude password)
      {
        $project: {
          Password: 0,
          __v: 0
        }
      },
      // Stage 3: Lookup bookings for this user
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'UserID',
          as: 'bookings'
        }
      },
      // Stage 4: Unwind bookings (if exists) to enable nested lookups
      {
        $unwind: {
          path: '$bookings',
          preserveNullAndEmptyArrays: true
        }
      },
      // Stage 5: Lookup room details for each booking
      {
        $lookup: {
          from: 'rooms',
          localField: 'bookings.RoomID',
          foreignField: '_id',
          as: 'bookings.room'
        }
      },
      // Stage 6: Unwind room array
      {
        $unwind: {
          path: '$bookings.room',
          preserveNullAndEmptyArrays: true
        }
      },
      // Stage 7: Lookup hotel details for each booking
      {
        $lookup: {
          from: 'hotels',
          localField: 'bookings.room.HotelID',
          foreignField: '_id',
          as: 'bookings.hotel'
        }
      },
      // Stage 8: Unwind hotel array
      {
        $unwind: {
          path: '$bookings.hotel',
          preserveNullAndEmptyArrays: true
        }
      },
      // Stage 9: Group back to reconstruct user with bookings array
      {
        $group: {
          _id: '$_id',
          Name: { $first: '$Name' },
          Email: { $first: '$Email' },
          Role: { $first: '$Role' },
          ContactNumber: { $first: '$ContactNumber' },
          Address: { $first: '$Address' },
          City: { $first: '$City' },
          Country: { $first: '$Country' },
          DateOfBirth: { $first: '$DateOfBirth' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          bookings: {
            $push: '$bookings'
          }
        }
      },
      // Stage 10: Project the final structure with formatted bookings
      {
        $project: {
          _id: 1,
          Name: 1,
          Email: 1,
          Role: 1,
          ContactNumber: 1,
          Address: 1,
          City: 1,
          Country: 1,
          DateOfBirth: 1,
          createdAt: 1,
          updatedAt: 1,
          bookings: {
            $map: {
              input: '$bookings',
              as: 'booking',
              in: {
                _id: '$$booking._id',
                BookingID: '$$booking.BookingID',
                NumberOfRooms: '$$booking.NumberOfRooms',
                CheckInDate: '$$booking.CheckInDate',
                CheckOutDate: '$$booking.CheckOutDate',
                Status: '$$booking.Status',
                createdAt: '$$booking.createdAt',
                updatedAt: '$$booking.updatedAt',
                room: {
                  _id: '$$booking.room._id',
                  RoomID: '$$booking.room.RoomID',
                  Type: '$$booking.room.Type',
                  Price: '$$booking.room.Price',
                  Availability: '$$booking.room.Availability',
                  Features: '$$booking.room.Features',
                  Image: '$$booking.room.Image'
                },
                hotel: {
                  _id: '$$booking.hotel._id',
                  HotelID: '$$booking.hotel.HotelID',
                  Name: '$$booking.hotel.Name',
                  Location: '$$booking.hotel.Location',
                  Address: '$$booking.hotel.Address',
                  Rating: '$$booking.hotel.Rating',
                  Image: '$$booking.hotel.Image'
                }
              }
            }
          }
        }
      }
    ]);

    if (!accountData || accountData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = accountData[0];

    // Format the response to match the expected structure
    const response = {
      success: true,
      data: {
        user: {
          _id: userData._id,
          name: userData.Name,
          email: userData.Email,
          role: userData.Role,
          contactNumber: userData.ContactNumber,
          address: userData.Address || '',
          city: userData.City || '',
          country: userData.Country || '',
          dateOfBirth: userData.DateOfBirth,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        },
        bookings: userData.bookings.map(booking => ({
          id: booking.BookingID || booking._id,
          _id: booking._id,
          hotelName: booking.hotel?.Name || 'N/A',
          hotel: booking.hotel?.Name || 'N/A',
          roomType: booking.room?.Type || 'N/A',
          room: booking.room?.Type || 'N/A',
          checkInDate: booking.CheckInDate,
          checkOutDate: booking.CheckOutDate,
          status: booking.Status,
          numberOfRooms: booking.NumberOfRooms,
          price: booking.room?.Price || 0,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt
        }))
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Get account data error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
