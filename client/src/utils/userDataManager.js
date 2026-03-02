/**
 * User Data Manager - Handles user-specific data isolation
 * Each user has their own isolated data in localStorage
 */

const USER_DATA_PREFIX = 'userdata_';
const USER_BOOKINGS_KEY = 'bookings';
const USER_REVIEWS_KEY = 'reviews';
const USER_PAYMENTS_KEY = 'payments';
const USER_LOYALTY_KEY = 'loyalty';

/**
 * Get user-specific key for localStorage
 * @param {number|string} userId - The user's ID
 * @param {string} dataType - Type of data (bookings, reviews, redemptions, payments, loyalty)
 * @returns {string} - Prefixed key for localStorage
 */
export const getUserDataKey = (userId, dataType) => {
  return `${USER_DATA_PREFIX}${userId}_${dataType}`;
};

/**
 * Save user-specific data to localStorage
 * @param {number|string} userId - The user's ID
 * @param {string} dataType - Type of data
 * @param {*} data - Data to save
 */
export const saveUserData = (userId, dataType, data) => {
  if (!userId) return;
  const key = getUserDataKey(userId, dataType);
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving user data for ${dataType}:`, error);
  }
};

/**
 * Load user-specific data from localStorage
 * @param {number|string} userId - The user's ID
 * @param {string} dataType - Type of data
 * @param {*} defaultValue - Default value if data not found
 * @returns {*} - Loaded data or default value
 */
export const loadUserData = (userId, dataType, defaultValue = null) => {
  if (!userId) return defaultValue;
  const key = getUserDataKey(userId, dataType);
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error loading user data for ${dataType}:`, error);
    return defaultValue;
  }
};

/**
 * Clear all data for a specific user
 * @param {number|string} userId - The user's ID
 */
export const clearUserData = (userId) => {
  if (!userId) return;
  const dataTypes = [
    USER_BOOKINGS_KEY,
    USER_REVIEWS_KEY,
    USER_PAYMENTS_KEY,
    USER_LOYALTY_KEY
  ];
  
  dataTypes.forEach(dataType => {
    const key = getUserDataKey(userId, dataType);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error clearing user data for ${dataType}:`, error);
    }
  });
};

/**
 * Get user bookings
 */
export const getUserBookings = (userId) => {
  return loadUserData(userId, USER_BOOKINGS_KEY, []);
};

export const saveUserBookings = (userId, bookings) => {
  saveUserData(userId, USER_BOOKINGS_KEY, bookings);
};

/**
 * Get user reviews
 */
export const getUserReviews = (userId) => {
  return loadUserData(userId, USER_REVIEWS_KEY, []);
};

export const saveUserReviews = (userId, reviews) => {
  saveUserData(userId, USER_REVIEWS_KEY, reviews);
};

/**
 * Get user payments
 */
export const saveUserPayments = (userId, payments) => {
  saveUserData(userId, USER_PAYMENTS_KEY, payments);
};

/**
 * Get user loyalty
 */
export const getUserLoyalty = (userId) => {
  return loadUserData(userId, USER_LOYALTY_KEY, { pointsBalance: 0, history: [] });
};

export const saveUserLoyalty = (userId, loyalty) => {
  saveUserData(userId, USER_LOYALTY_KEY, loyalty);
};
