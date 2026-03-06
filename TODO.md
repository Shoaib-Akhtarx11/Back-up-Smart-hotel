# TODO - Fix Manager Dashboard Rooms Feature

## Issues:
1. "Add Room" button in ManagerDashboard.jsx navigates to wrong page
2. RoomTable.jsx uses wrong field names (id vs _id, type vs Type, etc.)
3. Missing proper AddRoomForm for adding rooms

## Fix Plan:
- [x] 1. Fix ManagerDashboard.jsx - Add state for room modal and fix "Add Room" button
- [x] 2. Fix RoomTable.jsx - Update field mappings to match API response
- [x] 3. Create/Update AddRoomForm.jsx - Add proper room creation form
- [x] 4. Test the application - Build and ESLint passed

