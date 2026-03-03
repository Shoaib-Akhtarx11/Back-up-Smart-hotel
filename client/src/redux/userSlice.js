import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'users',
    initialState: {
        allUsers: [],
        recentVisits: []
    },
    reducers: {
        addToRecentVisits: (state, action) => {
            if (!Array.isArray(state.recentVisits)) state.recentVisits = [];
            const exists = state.recentVisits.find(h => h._id === action.payload._id);
            if (!exists) {
                state.recentVisits.unshift(action.payload);
                if (state.recentVisits.length > 5) state.recentVisits.pop();
            }
        }
    }
});

export const { addToRecentVisits } = userSlice.actions;

export default userSlice.reducer;