import { createSlice, createSelector } from '@reduxjs/toolkit';
import roomsData from "../data/rooms.json";

const roomSlice = createSlice({
  name: 'rooms',
  initialState: {
    allRooms: roomsData || [], // Always load from JSON on app start
    loading: false,
    error: null
  },
  reducers: {
    updateRoomAvailability: (state, action) => {
      const { roomId, availability } = action.payload;
      const room = state.allRooms.find(r => r.id === roomId);
      if (room) {
        room.availability = availability;
        // Persist room availability to localStorage
        const allRooms = JSON.parse(localStorage.getItem('allRooms') || JSON.stringify(state.allRooms));
        const roomIndex = allRooms.findIndex(r => r.id === roomId);
        if (roomIndex !== -1) {
          allRooms[roomIndex].availability = availability;
          localStorage.setItem('allRooms', JSON.stringify(allRooms));
        }
      }
    },

    addRoom: (state, action) => {
      state.allRooms.push(action.payload);
      // Sync to localStorage
      localStorage.setItem('allRooms', JSON.stringify(state.allRooms));
    },

    deleteRoom: (state, action) => {
      state.allRooms = state.allRooms.filter(r => r.id !== action.payload);
      // Sync to localStorage
      localStorage.setItem('allRooms', JSON.stringify(state.allRooms));
    },

    updateRoom: (state, action) => {
      const index = state.allRooms.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.allRooms[index] = { ...state.allRooms[index], ...action.payload };
      }
      // Sync to localStorage
      localStorage.setItem('allRooms', JSON.stringify(state.allRooms));
    }
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
        room => String(room.hotelId).toLowerCase() === String(hotelId).toLowerCase()
      )
  );
export default roomSlice.reducer;