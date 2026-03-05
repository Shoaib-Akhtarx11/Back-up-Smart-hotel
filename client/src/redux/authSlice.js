import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

// Async thunk to verify user with server
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'GET',
        credentials: 'include', // Important: include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        return data.data;
      } else {
        // If not authenticated, return null
        return null;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Get user from session storage
const getStoredUser = () => {
  try {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  token: null, // Token is stored in HTTP-only cookie
  isAuthenticated: !!sessionStorage.getItem("user"),
  loading: true, // Start with loading true to allow auth check
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { user } = action.payload;
      state.isAuthenticated = true;
      state.user = user;
      state.token = null;
      state.error = null;
      state.loading = false;
      // Store user in session storage (not localStorage)
      sessionStorage.setItem("user", JSON.stringify(user));
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      // Clear session storage
      sessionStorage.removeItem("user");
      
      // Call logout endpoint to clear cookie
      fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      }).catch(err => console.error("Logout error:", err));
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      sessionStorage.setItem("user", JSON.stringify(state.user));
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
          sessionStorage.setItem("user", JSON.stringify(action.payload));
        } else {
          state.user = null;
          state.isAuthenticated = false;
          sessionStorage.removeItem("user");
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        sessionStorage.removeItem("user");
      });
  }
});

export const { login, logout, updateUser, setLoading } = authSlice.actions;
export default authSlice.reducer;

