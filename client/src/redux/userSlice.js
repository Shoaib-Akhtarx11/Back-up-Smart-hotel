import { createSlice } from '@reduxjs/toolkit';
import usersDataFromJson from '../data/users.json'; 
import { saveUserLoyalty } from '../utils/userDataManager';

const userSlice = createSlice({
    name: 'users', // Matches your "users" key in persist data
    initialState: {
        allUsers: usersDataFromJson || [], 
        loyalty: { pointsBalance: 0, history: [] }, // ALWAYS start empty - load from userDataManager
        recentVisits: [] 
    },
    reducers: {
        addLoyaltyPoints: (state, action) => {
            const { points, activity, userId } = action.payload;
            
            // Get the user ID - from action payload or from current auth state
            let currentUserId = userId;
            if (!currentUserId) {
                const authData = localStorage.getItem("authState");
                try {
                    if (authData) {
                        const parsed = JSON.parse(authData);
                        currentUserId = parsed?.user?.id;
                    }
                } catch (e) {
                    console.error("Error getting user ID:", e);
                }
            }
            
            // --- CRITICAL FIX ---
            // Force re-initialization if loyalty is an array or invalid
            if (!state.loyalty || Array.isArray(state.loyalty)) {
                state.loyalty = { pointsBalance: 0, history: [] };
            }

            if (!Array.isArray(state.loyalty.history)) {
                state.loyalty.history = [];
            }

            const numericPoints = Math.floor(Number(points) || 0);
            state.loyalty.pointsBalance += Math.floor(numericPoints * 0.10);

            state.loyalty.history.unshift({
                id: Date.now(),
                activity: activity || "Hotel Stay",
                date: new Date().toLocaleDateString('en-GB', { 
                    day: '2-digit', month: 'short', year: 'numeric' 
                }),
                points: numericPoints
            });

            // Save with BOTH old and new format keys for consistency
            if (currentUserId) {
                // Save to new userDataManager format
                saveUserLoyalty(currentUserId, state.loyalty);
                // Also save to old key for backward compatibility
                localStorage.setItem(`userLoyalty_${currentUserId}`, JSON.stringify(state.loyalty));
            }
        },

        clearLoyalty: (state) => {
            state.loyalty = { pointsBalance: 0, history: [] };
        },

        addToRecentVisits: (state, action) => {
            if (!Array.isArray(state.recentVisits)) state.recentVisits = [];
            const exists = state.recentVisits.find(h => h.id === action.payload.id);
            if (!exists) {
                state.recentVisits.unshift(action.payload);
                if (state.recentVisits.length > 5) state.recentVisits.pop();
            }
        },

        deleteUser: (state, action) => {
            state.allUsers = state.allUsers.filter(user => user.id !== action.payload);
        },

        updateUser: (state, action) => {
            const index = state.allUsers.findIndex(user => user.id === action.payload.id);
            if (index !== -1) {
                state.allUsers[index] = { ...state.allUsers[index], ...action.payload };
            }
        }
    }
});

export const { 
    addLoyaltyPoints,
    clearLoyalty, 
    addToRecentVisits, 
    deleteUser, 
    updateUser
} = userSlice.actions;

export const selectLoyalty = (state) => state.users.loyalty;

export default userSlice.reducer;