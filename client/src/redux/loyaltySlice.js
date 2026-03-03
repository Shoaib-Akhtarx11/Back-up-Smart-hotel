import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

export const fetchUserLoyalty = createAsyncThunk('loyalty/fetchUserLoyalty', async () => {
  const res = await fetch(`${API_BASE}/api/loyalty`, {
    credentials: 'include'
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch loyalty data');
  }
  return data.data;
});

export const addLoyaltyPoints = createAsyncThunk('loyalty/addLoyaltyPoints', async (pointsData) => {
  const res = await fetch(`${API_BASE}/api/loyalty/add-points`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pointsData)
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to add points');
  }
  return data.data;
});

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState: {
    userLoyalty: null,
    loading: false,
    error: null
  },
  reducers: {
    clearLoyaltyError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserLoyalty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserLoyalty.fulfilled, (state, action) => {
        state.loading = false;
        state.userLoyalty = action.payload;
      })
      .addCase(fetchUserLoyalty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addLoyaltyPoints.fulfilled, (state, action) => {
        state.userLoyalty = action.payload;
      });
  }
});

export const { clearLoyaltyError } = loyaltySlice.actions;
export default loyaltySlice.reducer;
