import { createSlice } from "@reduxjs/toolkit";
import { clearUserData } from "../utils/userDataManager";

// Helper to safely get users
const getStoredUsers = () => {
  try {
    const users = localStorage.getItem("allUsers");
    const parsed = users ? JSON.parse(users) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const initialState = {
  user: JSON.parse(localStorage.getItem("activeUser")) || null,
  isAuthenticated: !!localStorage.getItem("activeUser"),
  role: localStorage.getItem("activeRole") || null,
  // Ensure this is ALWAYS an array
  registeredUsers: getStoredUsers(), 
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    registerUser: (state, action) => {
      // Defensive check: if for some reason state.registeredUsers is not an array, reset it
      const currentUsers = Array.isArray(state.registeredUsers) ? state.registeredUsers : [];
      
      // Update state
      state.registeredUsers = [...currentUsers, action.payload];
      
      // Sync with localStorage
      localStorage.setItem("allUsers", JSON.stringify(state.registeredUsers));
      state.error = null;
    },

    login: (state, action) => {
      const { user, role } = action.payload;
      state.isAuthenticated = true;
      state.user = user;
      state.role = role;
      state.error = null;
      localStorage.setItem("activeUser", JSON.stringify(user));
      localStorage.setItem("activeRole", role);
      
      // Clear old loyalty data to prevent cross-user pollution
      const oldKeys = ['loyaltyPoints', 'loyaltyHistory', 'userLoyalty', 'userdata_loyalty'];
      oldKeys.forEach(key => {
        localStorage.removeItem(key);
        if (user?.id) {
          localStorage.removeItem(`${key}_${user.id}`);
        }
      });
    },

    logout: (state) => {
      // Clear all user-specific data from localStorage before logging out
      if (state.user?.id) {
        clearUserData(state.user.id);
      }
      
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      localStorage.removeItem("activeUser");
      localStorage.removeItem("activeRole");
    },

    updateAuthUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("activeUser", JSON.stringify(action.payload));
    },

    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { login, logout, registerUser, setError, updateAuthUser } = authSlice.actions;
export default authSlice.reducer;