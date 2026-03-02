import { createSlice, createSelector } from '@reduxjs/toolkit';
import reviewsData from "../data/reviews.json";

const normalizeReview = (review) => ({
  id: review.ReviewID || review.id || `REV-${Math.random()}`,
  userId: review.UserID || review.userId,
  bookingId: review.bookingId || null,
  guestName: review.GuestName || review.guestName || review.userName || 'Anonymous',
  hotelId: review.HotelID || review.hotelId,
  hotelName: review.hotelName || '',
  rating: review.Rating || review.rating || 0,
  comment: review.Comment || review.comment || '',
  reviewDate: review.ReviewDate || review.reviewDate || review.Timestamp || review.timestamp || new Date().toISOString(),
  managerReply: review.ManagerReply || review.managerReply || null,
  repliedAt: review.RepliedAt || review.repliedAt || null,
  managerId: review.managerId || null,
  isDeleted: review.isDeleted || false,
  isApproved: review.isApproved !== undefined ? review.isApproved : true,
  responses: review.responses || [] // Array for multiple manager responses/feedback
});

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    allReviews: (reviewsData || []).map(normalizeReview),
    loading: false,
    error: null
  },
  reducers: {
    addReview: (state, action) => {
      const newReview = {
        id: `REV-${Date.now()}`,
        ...action.payload,
        reviewDate: new Date().toISOString(),
        managerReply: null,
        repliedAt: null,
        managerId: null,
        isDeleted: false,
        isApproved: true, // Reviews now display immediately
        responses: []
      };
      state.allReviews.push(newReview);
      // Sync to localStorage
      localStorage.setItem('allReviews', JSON.stringify(state.allReviews));
    },

    updateReview: (state, action) => {
      const index = state.allReviews.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.allReviews[index] = { ...state.allReviews[index], ...action.payload };
      }
      // Sync to localStorage
      localStorage.setItem('allReviews', JSON.stringify(state.allReviews));
    },

    addManagerResponse: (state, action) => {
      const review = state.allReviews.find(r => r.id === action.payload.reviewId);
      if (review) {
        review.managerReply = action.payload.response;
        review.repliedAt = new Date().toISOString();
        review.managerId = action.payload.managerId;
        // Sync to localStorage
        localStorage.setItem('allReviews', JSON.stringify(state.allReviews));
      }
    },

    addReviewResponse: (state, action) => {
      const review = state.allReviews.find(r => r.id === action.payload.reviewId);
      if (review) {
        if (!review.responses) {
          review.responses = [];
        }
        review.responses.push({
          id: `RESP-${Date.now()}`,
          managerId: action.payload.managerId,
          managerName: action.payload.managerName,
          response: action.payload.response,
          respondedAt: new Date().toISOString(),
          isApproved: false
        });
      }
    },

    approveReview: (state, action) => {
      const review = state.allReviews.find(r => r.id === action.payload);
      if (review) {
        review.isApproved = true;
      }
    },

    approveResponse: (state, action) => {
      const review = state.allReviews.find(r => r.id === action.payload.reviewId);
      if (review && review.responses) {
        const response = review.responses.find(r => r.id === action.payload.responseId);
        if (response) {
          response.isApproved = true;
        }
      }
    },

    deleteReview: (state, action) => {
      state.allReviews = state.allReviews.filter(r => r.id !== action.payload);
      // Sync to localStorage
      localStorage.setItem('allReviews', JSON.stringify(state.allReviews));
    }
  }
});

export const { 
  addReview, 
  updateReview, 
  addManagerResponse, 
  addReviewResponse,
  approveReview,
  approveResponse,
  deleteReview 
} = reviewSlice.actions;

// --------------------
// Memoized Selectors
// --------------------
export const selectAllReviews = (state) => state.reviews?.allReviews || [];

export const selectApprovedReviews = createSelector(
  [selectAllReviews],
  (reviews) => reviews.filter(r => r.isApproved && !r.isDeleted)
);

export const selectPendingReviews = createSelector(
  [selectAllReviews],
  (reviews) => reviews.filter(r => !r.isApproved && !r.isDeleted)
);

export const selectHotelReviews = (hotelId) =>
  createSelector([selectAllReviews], (reviews) =>
    reviews.filter(r => String(r.hotelId).toLowerCase() === String(hotelId).toLowerCase() && !r.isDeleted)
  );

export const selectUserReviews = (userId) =>
  createSelector([selectAllReviews], (reviews) =>
    reviews.filter(r => r.userId === userId && !r.isDeleted)
  );

export const selectHotelPendingReviews = (hotelId) =>
  createSelector([selectAllReviews], (reviews) =>
    reviews.filter(r => r.hotelId === hotelId && !r.isApproved && !r.isDeleted)
  );

export default reviewSlice.reducer;
