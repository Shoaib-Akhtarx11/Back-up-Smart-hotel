import { createSlice } from "@reduxjs/toolkit";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

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
  loading: false,
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
      // Store user in session storage (not localStorage)
      sessionStorage.setItem("user", JSON.stringify(user));
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
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
    }
  }
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

