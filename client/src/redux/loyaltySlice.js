import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

export const fetchUserLoyalty = createAsyncThunk('loyalty/fetchUserLoyalty', async (userId) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/loyalty/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch loyalty account');
  }
  return data.data;
});

export const addLoyaltyPoints = createAsyncThunk('loyalty/addPoints', async ({ userId, points }) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/loyalty/add-points`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ UserID: userId, Points: points })
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to add loyalty points');
  }
  return data.data;
});

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState: {
    account: null,
    pointsBalance: 0,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserLoyalty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserLoyalty.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload;
        state.pointsBalance = action.payload.PointsBalance;
      })
      .addCase(fetchUserLoyalty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addLoyaltyPoints.fulfilled, (state, action) => {
        state.account = action.payload;
        state.pointsBalance = action.payload.PointsBalance;
      });
  }
});

export default loyaltySlice.reducer;
