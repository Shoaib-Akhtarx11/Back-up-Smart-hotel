import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer,FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';
import hotelReducer from './hotelSlice';
import userReducer from './userSlice';
import roomReducer from './roomSlice';
import bookingReducer from './bookingSlice';
import paymentReducer from './paymentSlice';
import reviewReducer from './reviewSlice';
import redemptionReducer from './redemptionSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  hotels: hotelReducer,
  users: userReducer,
  rooms: roomReducer,
  bookings: bookingReducer,
  payments: paymentReducer,
  reviews: reviewReducer,
  redemptions: redemptionReducer,
});

const persistConfig = {
  key: 'smart-hotel-v1',
  storage,
  whitelist: ['auth', 'users', 'bookings', 'payments', 'redemptions', 'hotels', 'rooms', 'reviews'] // Persist all critical data
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore these paths that may contain non-serializable data
        ignoredActionPaths: ['payload'],
        ignoredPaths: [
          'bookings.allBookings',
          'payments.allPayments',
          'redemptions.allRedemptions'
        ]
      },
    }),
});

export const persistor = persistStore(store);