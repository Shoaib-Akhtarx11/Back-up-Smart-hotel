import { createSlice } from '@reduxjs/toolkit';

const redemptionSlice = createSlice({
  name: 'redemptions',
  initialState: {
    allRedemptions: [],
    pointsPerRupee: 100,
    loading: false,
    error: null
  },
  reducers: {}
});

export default redemptionSlice.reducer;