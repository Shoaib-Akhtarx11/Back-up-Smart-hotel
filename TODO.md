# Fix Booking Cancellation Issues

## Issues to Fix:
1. **403 Forbidden Error**: When user tries to cancel a booking
2. **Modal not closing**: After clicking cancel button

## Root Cause:
- Route ordering issue in `server/routes/booking.routes.js`
- The specific route `/api/bookings/:id/cancel` was defined AFTER the general `/:id` route
- Express matched `/:id` first and applied `authorize('admin', 'manager')` middleware which caused the 403

## Steps:
1. [x] Analyze the code and understand the issue
2. [x] Fix route ordering in booking.routes.js - Moved `/:id/cancel` route BEFORE `/:id` route
3. [ ] Test the fix

## Files Edited:
- `server/routes/booking.routes.js` - Reordered routes to fix 403 error

## Solution Applied:
The `router.delete('/:id/cancel', protect, cancelBooking)` route is now defined BEFORE the general `router.route('/:id')` route. This ensures:
- User's cancel request matches the correct route
- The `protect` middleware (not `authorize`) is applied
- Users can cancel their own bookings (authorization is checked in the controller)
- Modal will close on successful cancellation

