import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

// Async thunk to fetch all users (admin only)
export const fetchAllUsers = createAsyncThunk('users/fetchAllUsers', async () => {
  const res = await fetch(`${API_BASE}/api/auth/users`, {
    credentials: 'include',
    headers: { 
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch users');
  }
  return data.data;
});

// Async thunk to fetch users from backend (legacy)
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    credentials: 'include'
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch users');
  }
  console.log(data)
  return data.data;
});

const userSlice = createSlice({
  name: 'users',
  initialState: {
    allUsers: [],
    recentVisits: [],
    loading: false,
    error: null
  },
  reducers: {
    addToRecentVisits: (state, action) => {
      if (!Array.isArray(state.recentVisits)) state.recentVisits = [];
      const exists = state.recentVisits.find(u => u._id === action.payload._id);
      if (!exists) {
        state.recentVisits.unshift(action.payload);
        if (state.recentVisits.length > 5) state.recentVisits.pop();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers (legacy)
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.allUsers = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // fetchAllUsers (admin)
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.allUsers = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { addToRecentVisits } = userSlice.actions;

// Selectors
export const selectAllUsers = (state) => state.users.allUsers;
export const selectRecentVisits = (state) => state.users.recentVisits;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;

export default userSlice.reducer;

