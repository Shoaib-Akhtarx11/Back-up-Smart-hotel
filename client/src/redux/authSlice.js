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
      } else if (res.status === 401) {
        // Not authenticated - return null specifically, not an error
        return null;
      } else {
        // Other errors (500, etc.) - reject with error
        return rejectWithValue(data.message || 'Authentication check failed');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      return rejectWithValue(error.message || 'Network error during authentication');
    }
  }
);

// Async thunk for logout - properly handles the logout process
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      // Even if the server call fails, we should clear the client state
      return true; 
    }
  }
);

// Get user from session storage (NOT localStorage)
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
  token: null, // Token is stored in HTTP-only cookie only
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

    // Clear error state
    clearError: (state) => {
      state.error = null;
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
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.error = null;
          sessionStorage.setItem("user", JSON.stringify(action.payload));
        } else {
          // User is not authenticated (null returned)
          state.user = null;
          state.isAuthenticated = false;
          sessionStorage.removeItem("user");
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Authentication failed';
        sessionStorage.removeItem("user");
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loading = false;
        sessionStorage.removeItem("user");
      })
      .addCase(logout.rejected, (state) => {
        // Even on failure, clear the client state
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        sessionStorage.removeItem("user");
      });
  }
});

export const { login, clearError, updateUser, setLoading } = authSlice.actions;
export default authSlice.reducer;

