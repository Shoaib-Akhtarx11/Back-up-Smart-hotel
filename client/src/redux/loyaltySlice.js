import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

// Fetch current user's loyalty account
export const fetchUserLoyalty = createAsyncThunk('loyalty/fetchUserLoyalty', async () => {
  const res = await fetch(`${API_BASE}/api/loyalty/me`, {
    credentials: 'include'
  });
  const data = await res.json();
  if (!data.success && res.status !== 200) {
    // Return default values if account not found
    return {
      PointsBalance: 0,
      RedemptionPointsBalance: 0,
      History: []
    };
  }
  return data.data;
});

// Add loyalty points (internal use)
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

// Purchase redemption points with loyalty points (1:1 ratio)
export const purchaseRedemptionPoints = createAsyncThunk('loyalty/purchaseRedemptionPoints', async (points, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/api/loyalty/purchase-redemption`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Points: points })
    });
    const data = await res.json();
    if (!data.success) {
      return rejectWithValue(data.message);
    }
    return data.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState: {
    userLoyalty: null,
    loading: false,
    error: null,
    redemptionLoading: false,
    redemptionError: null,
    redemptionSuccess: false
  },
  reducers: {
    clearLoyaltyError: (state) => {
      state.error = null;
    },
    clearRedemptionStatus: (state) => {
      state.redemptionError = null;
      state.redemptionSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user loyalty
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
      // Add loyalty points
      .addCase(addLoyaltyPoints.fulfilled, (state, action) => {
        state.userLoyalty = action.payload;
      })
      // Purchase redemption points
      .addCase(purchaseRedemptionPoints.pending, (state) => {
        state.redemptionLoading = true;
        state.redemptionError = null;
        state.redemptionSuccess = false;
      })
      .addCase(purchaseRedemptionPoints.fulfilled, (state, action) => {
        state.redemptionLoading = false;
        state.userLoyalty = action.payload;
        state.redemptionSuccess = true;
      })
      .addCase(purchaseRedemptionPoints.rejected, (state, action) => {
        state.redemptionLoading = false;
        state.redemptionError = action.payload || 'Failed to purchase redemption points';
      });
  }
});

export const { clearLoyaltyError, clearRedemptionStatus } = loyaltySlice.actions;
export default loyaltySlice.reducer;

// Selectors
export const selectUserLoyalty = (state) => state.loyalty?.userLoyalty || null;
export const selectLoyaltyLoading = (state) => state.loyalty?.loading || false;
export const selectLoyaltyError = (state) => state.loyalty?.error || null;
export const selectRedemptionLoading = (state) => state.loyalty?.redemptionLoading || false;
export const selectRedemptionError = (state) => state.loyalty?.redemptionError || null;
export const selectRedemptionSuccess = (state) => state.loyalty?.redemptionSuccess || false;

// Convenience selectors
export const selectLoyaltyPoints = (state) => state.loyalty?.userLoyalty?.PointsBalance || 0;
export const selectRedemptionPoints = (state) => state.loyalty?.userLoyalty?.RedemptionPointsBalance || 0;
export const selectLoyaltyHistory = (state) => state.loyalty?.userLoyalty?.History || [];

