import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

export const fetchUserBookings = createAsyncThunk('bookings/fetchUserBookings', async () => {
  const res = await fetch(`${API_BASE}/api/bookings`, {
    credentials: 'include',
    headers: { 
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch bookings');
  }
  return data.data;
});

export const createBooking = createAsyncThunk('bookings/createBooking', async (bookingData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    credentials: 'include',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(bookingData)
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to create booking');
  }
  return data.data;
});

export const cancelBooking = createAsyncThunk('bookings/cancelBooking', async (bookingId) => {
  const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to cancel booking');
  }
  return bookingId;
});

// Admin: Update booking status (approve/reject)
export const updateBookingStatus = createAsyncThunk('bookings/updateBookingStatus', async ({ bookingId, status }) => {
  const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ Status: status })
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to update booking status');
  }
  return data.data;
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    allBookings: [],
    userBookings: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.userBookings = action.payload;
        state.allBookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.userBookings.push(action.payload);
        state.allBookings.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.userBookings = state.userBookings.filter(b => b._id !== action.payload);
        state.allBookings = state.allBookings.filter(b => b._id !== action.payload);
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        // Update the booking in both arrays
        const updatedBooking = action.payload;
        const index = state.allBookings.findIndex(b => b._id === updatedBooking._id);
        if (index !== -1) {
          state.allBookings[index] = updatedBooking;
        }
        const userIndex = state.userBookings.findIndex(b => b._id === updatedBooking._id);
        if (userIndex !== -1) {
          state.userBookings[userIndex] = updatedBooking;
        }
      });
  }
});

export const selectAllBookings = (state) => state.bookings?.allBookings || [];
export const selectUserBookings = (state) => state.bookings?.userBookings || [];
export const selectBookingById = (state, bookingId) =>
  (state.bookings?.allBookings || []).find(b => b._id === bookingId);
export default bookingSlice.reducer;

