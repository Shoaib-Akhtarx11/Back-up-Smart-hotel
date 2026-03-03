import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

export const fetchHotelReviews = createAsyncThunk('reviews/fetchHotelReviews', async (hotelId) => {
  const res = await fetch(`${API_BASE}/api/reviews?HotelID=${hotelId}`);
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch reviews');
  }
  return data.data;
});

export const submitReview = createAsyncThunk('reviews/submitReview', async (reviewData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/reviews`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to submit review');
  }
  return data.data;
});

export const updateReview = createAsyncThunk('reviews/updateReview', async ({ reviewId, updates }) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to update review');
  }
  return data.data;
});

export const deleteReview = createAsyncThunk('reviews/deleteReview', async (reviewId) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete review');
  }
  return reviewId;
});

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    allReviews: [],
    hotelReviews: {},
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotelReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotelReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.allReviews = action.payload;
      })
      .addCase(fetchHotelReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.loading = false;
        state.allReviews.push(action.payload);
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.allReviews = state.allReviews.filter(r => r._id !== action.payload);
      });
  }
});

export const selectAllReviews = (state) => state.reviews?.allReviews || [];

export const selectApprovedReviews = createSelector(
  [selectAllReviews],
  (reviews) => reviews.filter(r => !r.isDeleted)
);

export const selectHotelReviews = (hotelId) =>
  createSelector([selectAllReviews], (reviews) =>
    reviews.filter(r => String(r.HotelID) === String(hotelId))
  );

export const selectUserReviews = (userId) =>
  createSelector([selectAllReviews], (reviews) =>
    reviews.filter(r => String(r.UserID) === String(userId))
  );

export default reviewSlice.reducer;
