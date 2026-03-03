import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

export const createPayment = createAsyncThunk('payment/createPayment', async (paymentData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/payments`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(paymentData)
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Payment failed');
  }
  return data.data;
});

export const fetchUserPayments = createAsyncThunk('payment/fetchUserPayments', async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/payments`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch payments');
  }
  return data.data;
});

export const refundPayment = createAsyncThunk('payment/refundPayment', async (paymentId) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/payments/${paymentId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Refund failed');
  }
  return data.data;
});

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    payments: [],
    currentPayment: null,
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    clearSuccess: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
        state.payments.push(action.payload);
        state.success = true;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchUserPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(refundPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      });
  }
});

export const { clearSuccess } = paymentSlice.actions;
export default paymentSlice.reducer;