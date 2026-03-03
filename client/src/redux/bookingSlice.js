import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

export const fetchUserBookings = createAsyncThunk('bookings/fetchUserBookings', async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/bookings`, {
    headers: { 'Authorization': `Bearer ${token}` }
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
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
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
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to cancel booking');
  }
  return bookingId;
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
      });
  }
});

export const selectAllBookings = (state) => state.bookings?.allBookings || [];
export const selectUserBookings = (state) => state.bookings?.userBookings || [];
export const selectBookingById = (state, bookingId) =>
  (state.bookings?.allBookings || []).find(b => b._id === bookingId);
export default bookingSlice.reducer;