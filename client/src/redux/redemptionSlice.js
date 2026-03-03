import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

export const fetchRedemptions = createAsyncThunk('redemptions/fetchRedemptions', async () => {
  const res = await fetch(`${API_BASE}/api/redemptions`, {
    credentials: 'include'
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch redemptions');
  }
  return data.data;
});

export const createRedemption = createAsyncThunk('redemptions/createRedemption', async (redemptionData) => {
  const res = await fetch(`${API_BASE}/api/redemptions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(redemptionData)
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to create redemption');
  }
  return data.data;
});

const redemptionSlice = createSlice({
  name: 'redemptions',
  initialState: {
    redemptions: [],
    loading: false,
    error: null
  },
  reducers: {
    clearRedemptionError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRedemptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRedemptions.fulfilled, (state, action) => {
        state.loading = false;
        state.redemptions = action.payload;
      })
      .addCase(fetchRedemptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createRedemption.fulfilled, (state, action) => {
        state.redemptions.push(action.payload);
      });
  }
});

export const { clearRedemptionError } = redemptionSlice.actions;
export default redemptionSlice.reducer;
