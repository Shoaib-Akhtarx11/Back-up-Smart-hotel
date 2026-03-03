import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

export const fetchRoomsByHotel = createAsyncThunk('rooms/fetchRoomsByHotel', async (hotelId) => {
  const res = await fetch(`${API_BASE}/api/rooms?HotelID=${hotelId}`);
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch rooms');
  }
  return data.data;
});

export const createRoom = createAsyncThunk('rooms/createRoom', async (roomData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/rooms`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(roomData)
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to create room');
  }
  return data.data;
});

const roomSlice = createSlice({
  name: 'rooms',
  initialState: {
    allRooms: [],
    loading: false,
    error: null
  },
  reducers: {
    updateRoomAvailability: (state, action) => {
      const { roomId, availability } = action.payload;
      const room = state.allRooms.find(r => r._id === roomId);
      if (room) {
        room.Availability = availability;
      }
    },

    addRoom: (state, action) => {
      state.allRooms.push(action.payload);
    },

    deleteRoom: (state, action) => {
      state.allRooms = state.allRooms.filter(r => r._id !== action.payload);
    },

    updateRoom: (state, action) => {
      const index = state.allRooms.findIndex(r => r._id === action.payload._id);
      if (index !== -1) {
        state.allRooms[index] = { ...state.allRooms[index], ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoomsByHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomsByHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.allRooms = action.payload;
      })
      .addCase(fetchRoomsByHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.allRooms.push(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { updateRoomAvailability, addRoom, deleteRoom, updateRoom } = roomSlice.actions;

// Base selectors
const selectAllRoomsBase = (state) => state.rooms?.allRooms || [];

// Memoized selectors to prevent unnecessary rerenders
export const selectAllRooms = selectAllRoomsBase;

// Memoized selector factory - returns same reference if data hasn't changed
export const selectRoomsByHotel = (hotelId) =>
  createSelector(
    [selectAllRoomsBase],
    (rooms) =>
      rooms.filter(
        room => String(room.HotelID).toLowerCase() === String(hotelId).toLowerCase()
      )
  );
export default roomSlice.reducer;