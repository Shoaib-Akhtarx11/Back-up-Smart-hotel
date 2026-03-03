import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

export const fetchReviews = createAsyncThunk('reviews/fetchReviews', async () => {
  const res = await fetch(`${API_BASE}/api/reviews`, {
    credentials: 'include'
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch reviews');
  }
  return data.data;
});

export const createReview = createAsyncThunk('reviews/createReview', async (reviewData) => {
  const res = await fetch(`${API_BASE}/api/reviews`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to create review');
  }
  return data.data;
});

export const deleteReview = createAsyncThunk('reviews/deleteReview', async (reviewId) => {
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
    method: 'DELETE',
    credentials: 'include'
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
    reviews: [],
    loading: false,
    error: null
  },
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.reviews.push(action.payload);
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
      });
  }
});

export const { clearReviewError } = reviewSlice.actions;

// Selector to get reviews for a specific hotel
export const selectHotelReviews = (hotelId) => (state) => 
  (state.reviews?.reviews || []).filter(
    review => String(review.HotelID) === String(hotelId) || 
              String(review.hotelId) === String(hotelId)
  );

// Base selector
export const selectAllReviews = (state) => state.reviews?.reviews || [];
export default reviewSlice.reducer;
