import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

export const redeemPoints = createAsyncThunk('redemption/redeemPoints', async (redemptionData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/redemptions`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(redemptionData)
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Redemption failed');
  }
  return data.data;
});

export const fetchUserRedemptions = createAsyncThunk('redemption/fetchUserRedemptions', async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/redemptions`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch redemptions');
  }
  return data.data;
});

const redemptionSlice = createSlice({
  name: 'redemptions',
  initialState: {
    allRedemptions: [],
    pointsPerRupee: 100,
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    clearSuccess: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(redeemPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(redeemPoints.fulfilled, (state, action) => {
        state.loading = false;
        state.allRedemptions.push(action.payload);
        state.success = true;
      })
      .addCase(redeemPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserRedemptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRedemptions.fulfilled, (state, action) => {
        state.loading = false;
        state.allRedemptions = action.payload;
      })
      .addCase(fetchUserRedemptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearSuccess } = redemptionSlice.actions;
export default redemptionSlice.reducer;