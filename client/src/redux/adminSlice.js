import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

// Async thunk to fetch dashboard stats
export const fetchDashboardStats = createAsyncThunk('admin/fetchDashboardStats', async () => {
  const res = await fetch(`${API_BASE}/api/admin/stats`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch stats');
  }
  return data.data;
});

// Async thunk to fetch all users
export const fetchAdminUsers = createAsyncThunk('admin/fetchUsers', async () => {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch users');
  }
  return data.data;
});

// Async thunk to fetch all hotels
export const fetchAdminHotels = createAsyncThunk('admin/fetchHotels', async () => {
  const res = await fetch(`${API_BASE}/api/admin/hotels`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch hotels');
  }
  return data.data;
});

// Async thunk to fetch all bookings
export const fetchAdminBookings = createAsyncThunk('admin/fetchBookings', async () => {
  const res = await fetch(`${API_BASE}/api/admin/bookings`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch bookings');
  }
  return data.data;
});

// Async thunk to fetch most booked hotels
export const fetchMostBookedHotels = createAsyncThunk('admin/fetchMostBooked', async () => {
  const res = await fetch(`${API_BASE}/api/admin/analytics/most-booked`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch analytics');
  }
  return data.data;
});

// Async thunk to fetch all reviews
export const fetchAdminReviews = createAsyncThunk('admin/fetchReviews', async () => {
  const res = await fetch(`${API_BASE}/api/admin/reviews`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch reviews');
  }
  return data.data;
});

// Async thunk to delete user
export const deleteUser = createAsyncThunk('admin/deleteUser', async (userId) => {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete user');
  }
  return userId;
});

// Async thunk to delete hotel
export const deleteHotel = createAsyncThunk('admin/deleteHotel', async (hotelId) => {
  const res = await fetch(`${API_BASE}/api/admin/hotels/${hotelId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete hotel');
  }
  return hotelId;
});

// Async thunk to update booking status
export const updateAdminBookingStatus = createAsyncThunk('admin/updateBookingStatus', async ({ bookingId, status }) => {
  const res = await fetch(`${API_BASE}/api/admin/bookings/${bookingId}/status`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to update booking status');
  }
  return data.data;
});

// Async thunk to update user role
export const updateUserRole = createAsyncThunk('admin/updateUserRole', async ({ userId, role }) => {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to update user role');
  }
  return data.data;
});

// Async thunk to delete review
export const deleteReview = createAsyncThunk('admin/deleteReview', async (reviewId) => {
  const res = await fetch(`${API_BASE}/api/admin/reviews/${reviewId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete review');
  }
  return reviewId;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    users: [],
    hotels: [],
    bookings: [],
    reviews: [],
    mostBookedHotels: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Hotels
      .addCase(fetchAdminHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload;
      })
      .addCase(fetchAdminHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Bookings
      .addCase(fetchAdminBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchAdminBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Most Booked Hotels
      .addCase(fetchMostBookedHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMostBookedHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.mostBookedHotels = action.payload;
      })
      .addCase(fetchMostBookedHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Reviews
      .addCase(fetchAdminReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchAdminReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u._id !== action.payload);
      })
      
      // Delete Hotel
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.hotels = state.hotels.filter(h => h._id !== action.payload);
      })
      
      // Update Booking Status
      .addCase(updateAdminBookingStatus.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      
      // Update User Role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      
      // Delete Review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
      });
  }
});

export const { clearError } = adminSlice.actions;

// Selectors
export const selectAdminStats = (state) => state.admin?.stats;
export const selectAdminUsers = (state) => state.admin?.users || [];
export const selectAdminHotels = (state) => state.admin?.hotels || [];
export const selectAdminBookings = (state) => state.admin?.bookings || [];
export const selectAdminReviews = (state) => state.admin?.reviews || [];
export const selectMostBookedHotels = (state) => state.admin?.mostBookedHotels || [];
export const selectAdminLoading = (state) => state.admin?.loading;
export const selectAdminError = (state) => state.admin?.error;

export default adminSlice.reducer;

