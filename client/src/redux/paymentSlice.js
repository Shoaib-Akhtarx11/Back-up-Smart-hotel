import { createSlice } from '@reduxjs/toolkit';
import { saveUserPayments } from '../utils/userDataManager';

const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    allPayments: [],
    loading: false,
    error: null
  },
  reducers: {
    recordPayment: (state, action) => {
      const newPayment = {
        id: `PAY-${Date.now()}`,
        ...action.payload,
        status: 'Success',
        timestamp: new Date().toISOString()
      };
      state.allPayments.push(newPayment);
      
      // Save to user-specific localStorage
      if (newPayment.userId) {
        const userPayments = state.allPayments.filter(p => p.userId === newPayment.userId);
        saveUserPayments(newPayment.userId, userPayments);
      }
    }
  }
});

export const { recordPayment } = paymentSlice.actions;
export default paymentSlice.reducer;