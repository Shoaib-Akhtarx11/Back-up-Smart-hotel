import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

// Async thunk to fetch current manager profile
export const fetchCurrentManager = createAsyncThunk(
  'manager/fetchCurrentManager',
  async () => {
    const res = await fetch(`${API_BASE}/api/managers/me`, getAuthHeader());
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch manager profile');
    }
    return data.data;
  }
);

// Async thunk to fetch all dashboard data for manager (hotels, rooms, bookings, reviews, statistics)
export const fetchManagerDashboardData = createAsyncThunk(
  'manager/fetchManagerDashboardData',
  async () => {
    const res = await fetch(`${API_BASE}/api/managers/dashboard-data`, getAuthHeader());
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch dashboard data');
    }
    return data.data;
  }
);

// Async thunk to fetch all managers (admin only)
export const fetchAllManagers = createAsyncThunk(
  'manager/fetchAllManagers',
  async () => {
    const res = await fetch(`${API_BASE}/api/managers`, getAuthHeader());
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch managers');
    }
    return data.data;
  }
);

// Async thunk to fetch manager by hotel ID
export const fetchManagerByHotelId = createAsyncThunk(
  'manager/fetchManagerByHotelId',
  async (hotelId) => {
    const res = await fetch(`${API_BASE}/api/managers/hotel/${hotelId}`, getAuthHeader());
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch manager by hotel ID');
    }
    return data.data;
  }
);

// Async thunk to fetch manager by user ID
export const fetchManagerByUserId = createAsyncThunk(
  'manager/fetchManagerByUserId',
  async (userId) => {
    const res = await fetch(`${API_BASE}/api/managers/user/${userId}`, getAuthHeader());
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch manager by user ID');
    }
    return data.data;
  }
);

// Async thunk to create manager profile
export const createManagerProfile = createAsyncThunk(
  'manager/createManagerProfile',
  async (hotelId) => {
    const res = await fetch(`${API_BASE}/api/managers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader().headers,
      },
      body: JSON.stringify({ HotelID: hotelId }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to create manager profile');
    }
    return data.data;
  }
);

// Async thunk to update manager status
export const updateManagerStatus = createAsyncThunk(
  'manager/updateManagerStatus',
  async ({ managerId, status }) => {
    const res = await fetch(`${API_BASE}/api/managers/${managerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader().headers,
      },
      body: JSON.stringify({ Status: status }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to update manager status');
    }
    return data.data;
  }
);

// Async thunk to assign hotel to manager (admin)
export const assignHotelToManager = createAsyncThunk(
  'manager/assignHotelToManager',
  async ({ ManagerID, HotelID }) => {
    const res = await fetch(`${API_BASE}/api/managers/assign-hotel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader().headers,
      },
      body: JSON.stringify({ ManagerID, HotelID }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to assign hotel to manager');
    }
    return data.data;
  }
);

// Async thunk to delete manager profile
export const deleteManagerProfile = createAsyncThunk(
  'manager/deleteManagerProfile',
  async (managerId) => {
    const res = await fetch(`${API_BASE}/api/managers/${managerId}`, {
      method: 'DELETE',
      ...getAuthHeader(),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete manager profile');
    }
    return managerId;
  }
);

const managerSlice = createSlice({
  name: 'manager',
  initialState: {
    currentManager: null,
    allManagers: [],
    managerByHotel: null,
    dashboardData: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearManagerError: (state) => {
      state.error = null;
    },
    clearManagerSuccess: (state) => {
      state.success = false;
    },
    clearCurrentManager: (state) => {
      state.currentManager = null;
    },
    clearDashboardData: (state) => {
      state.dashboardData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Current Manager
      .addCase(fetchCurrentManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentManager.fulfilled, (state, action) => {
        state.loading = false;
        state.currentManager = action.payload;
      })
      .addCase(fetchCurrentManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Manager Dashboard Data
      .addCase(fetchManagerDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchManagerDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch All Managers
      .addCase(fetchAllManagers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllManagers.fulfilled, (state, action) => {
        state.loading = false;
        state.allManagers = action.payload;
      })
      .addCase(fetchAllManagers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Manager By Hotel ID
      .addCase(fetchManagerByHotelId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerByHotelId.fulfilled, (state, action) => {
        state.loading = false;
        state.managerByHotel = action.payload;
      })
      .addCase(fetchManagerByHotelId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Manager By User ID
      .addCase(fetchManagerByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentManager = action.payload;
      })
      .addCase(fetchManagerByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Manager Profile
      .addCase(createManagerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createManagerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentManager = action.payload;
        state.success = true;
      })
      .addCase(createManagerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.success = false;
      })
      // Update Manager Status
      .addCase(updateManagerStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateManagerStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentManager && state.currentManager._id === action.payload._id) {
          state.currentManager = action.payload;
        }
        const index = state.allManagers.findIndex(m => m._id === action.payload._id);
        if (index !== -1) {
          state.allManagers[index] = action.payload;
        }
      })
      .addCase(updateManagerStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Assign Hotel To Manager
      .addCase(assignHotelToManager.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(assignHotelToManager.fulfilled, (state, action) => {
        state.loading = false;
        state.allManagers.push(action.payload);
        state.success = true;
      })
      .addCase(assignHotelToManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.success = false;
      })
      // Delete Manager Profile
      .addCase(deleteManagerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteManagerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.allManagers = state.allManagers.filter(m => m._id !== action.payload);
        if (state.currentManager && state.currentManager._id === action.payload) {
          state.currentManager = null;
        }
      })
      .addCase(deleteManagerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearManagerError, clearManagerSuccess, clearCurrentManager, clearDashboardData } = managerSlice.actions;

// Selectors
export const selectCurrentManager = (state) => state.manager.currentManager;
export const selectAllManagers = (state) => state.manager.allManagers;
export const selectManagerByHotel = (state) => state.manager.managerByHotel;
export const selectManagerDashboardData = (state) => state.manager.dashboardData;
export const selectManagerLoading = (state) => state.manager.loading;
export const selectManagerError = (state) => state.manager.error;
export const selectManagerSuccess = (state) => state.manager.success;

export default managerSlice.reducer;
