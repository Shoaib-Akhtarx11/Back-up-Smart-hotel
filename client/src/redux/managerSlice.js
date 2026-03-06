import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

// Async thunk to fetch manager dashboard stats
export const fetchManagerStats = createAsyncThunk('manager/fetchStats', async () => {
  const res = await fetch(`${API_BASE}/api/manager/stats`, getAuthHeader());
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch stats');
  }
  return data.data;
});

// Async thunk to fetch manager's hotels
export const fetchManagerHotels = createAsyncThunk('manager/fetchHotels', async () => {
  const res = await fetch(`${API_BASE}/api/manager/hotels`, getAuthHeader());
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch hotels');
  }
  return data.data;
});

// Async thunk to fetch manager's rooms
export const fetchManagerRooms = createAsyncThunk('manager/fetchRooms', async () => {
  const res = await fetch(`${API_BASE}/api/manager/rooms`, getAuthHeader());
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch rooms');
  }
  return data.data;
});

// Async thunk to fetch manager's bookings
export const fetchManagerBookings = createAsyncThunk('manager/fetchBookings', async () => {
  const res = await fetch(`${API_BASE}/api/manager/bookings`, getAuthHeader());
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch bookings');
  }
  return data.data;
});

// Async thunk to fetch manager's reviews
export const fetchManagerReviews = createAsyncThunk('manager/fetchReviews', async () => {
  const res = await fetch(`${API_BASE}/api/manager/reviews`, getAuthHeader());
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch reviews');
  }
  return data.data;
});

// Async thunk to add new hotel
export const addManagerHotel = createAsyncThunk('manager/addHotel', async (hotelData) => {
  const res = await fetch(`${API_BASE}/api/manager/hotels`, {
    method: 'POST',
    ...getAuthHeader(),
    body: JSON.stringify(hotelData)
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to add hotel');
  }
  return data.data;
});

// Async thunk to update hotel
export const updateManagerHotel = createAsyncThunk('manager/updateHotel', async ({ hotelId, hotelData }) => {
  const res = await fetch(`${API_BASE}/api/manager/hotels/${hotelId}`, {
    method: 'PUT',
    ...getAuthHeader(),
    body: JSON.stringify(hotelData)
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to update hotel');
  }
  return data.data;
});

// Async thunk to delete hotel
export const deleteManagerHotel = createAsyncThunk('manager/deleteHotel', async (hotelId) => {
  const res = await fetch(`${API_BASE}/api/manager/hotels/${hotelId}`, {
    method: 'DELETE',
    ...getAuthHeader()
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete hotel');
  }
  return hotelId;
});

// Async thunk to add new room
export const addManagerRoom = createAsyncThunk('manager/addRoom', async (roomData) => {
  const res = await fetch(`${API_BASE}/api/manager/rooms`, {
    method: 'POST',
    ...getAuthHeader(),
    body: JSON.stringify(roomData)
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to add room');
  }
  return data.data;
});

// Async thunk to update room
export const updateManagerRoom = createAsyncThunk('manager/updateRoom', async ({ roomId, roomData }) => {
  const res = await fetch(`${API_BASE}/api/manager/rooms/${roomId}`, {
    method: 'PUT',
    ...getAuthHeader(),
    body: JSON.stringify(roomData)
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to update room');
  }
  return data.data;
});

// Async thunk to delete room
export const deleteManagerRoom = createAsyncThunk('manager/deleteRoom', async (roomId) => {
  const res = await fetch(`${API_BASE}/api/manager/rooms/${roomId}`, {
    method: 'DELETE',
    ...getAuthHeader()
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete room');
  }
  return roomId;
});

// Async thunk to update booking status
export const updateManagerBookingStatus = createAsyncThunk('manager/updateBookingStatus', async ({ bookingId, status }) => {
  const res = await fetch(`${API_BASE}/api/manager/bookings/${bookingId}/status`, {
    method: 'PUT',
    ...getAuthHeader(),
    body: JSON.stringify({ status })  // Send lowercase 'status' to match backend
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to update booking status');
  }
  return data.data;
});

// Async thunk to delete review
export const deleteManagerReview = createAsyncThunk('manager/deleteReview', async (reviewId) => {
  const res = await fetch(`${API_BASE}/api/manager/reviews/${reviewId}`, {
    method: 'DELETE',
    ...getAuthHeader()
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete review');
  }
  return reviewId;
});

// Async thunk to get manager profile
export const fetchManagerProfile = createAsyncThunk('manager/fetchProfile', async () => {
  const res = await fetch(`${API_BASE}/api/manager/profile`, getAuthHeader());
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch profile');
  }
  return data.data;
});

const managerSlice = createSlice({
  name: 'manager',
  initialState: {
    stats: null,
    hotels: [],
    rooms: [],
    bookings: [],
    reviews: [],
    profile: null,
    loading: false,
    error: null
  },
  reducers: {
    clearManagerError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchManagerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchManagerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Hotels
      .addCase(fetchManagerHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload;
      })
      .addCase(fetchManagerHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Rooms
      .addCase(fetchManagerRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchManagerRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Bookings
      .addCase(fetchManagerBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchManagerBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Reviews
      .addCase(fetchManagerReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchManagerReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Add Hotel
      .addCase(addManagerHotel.fulfilled, (state, action) => {
        state.hotels.push(action.payload);
      })
      
      // Update Hotel
      .addCase(updateManagerHotel.fulfilled, (state, action) => {
        const index = state.hotels.findIndex(h => h._id === action.payload._id);
        if (index !== -1) {
          state.hotels[index] = action.payload;
        }
      })
      
      // Delete Hotel
      .addCase(deleteManagerHotel.fulfilled, (state, action) => {
        state.hotels = state.hotels.filter(h => h._id !== action.payload);
      })
      
      // Add Room
      .addCase(addManagerRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
      })
      
      // Update Room
      .addCase(updateManagerRoom.fulfilled, (state, action) => {
        const index = state.rooms.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
      })
      
      // Delete Room
      .addCase(deleteManagerRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter(r => r._id !== action.payload);
      })
      
      // Update Booking Status
      .addCase(updateManagerBookingStatus.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      
      // Delete Review
      .addCase(deleteManagerReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
      })
      
      // Profile
      .addCase(fetchManagerProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  }
});

export const { clearManagerError } = managerSlice.actions;

// Selectors
export const selectManagerStats = (state) => state.manager?.stats;
export const selectManagerHotels = (state) => state.manager?.hotels || [];
export const selectManagerRooms = (state) => state.manager?.rooms || [];
export const selectManagerBookings = (state) => state.manager?.bookings || [];
export const selectManagerReviews = (state) => state.manager?.reviews || [];
export const selectManagerProfile = (state) => state.manager?.profile;
export const selectManagerLoading = (state) => state.manager?.loading;
export const selectManagerError = (state) => state.manager?.error;

export default managerSlice.reducer;

