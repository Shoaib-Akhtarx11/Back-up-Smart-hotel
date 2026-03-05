# Manager Dashboard Fix - TODO

## Task: Fix Manager Dashboard not showing data by using aggregation operators in backend

### Steps:
1. [x] Analyze codebase and understand the issue
2. [ ] Add new backend endpoint with aggregation in manager.controller.js
3. [ ] Add new route in manager.routes.js
4. [ ] Update Redux slice with new thunk
5. [ ] Update ManagerDashboard.jsx to use new API

## Implementation Details:

### 1. Backend Controller (manager.controller.js)
- Create `getManagerDashboardData` function using MongoDB aggregation
- Fetch all hotels where ManagerID matches the logged-in manager
- Join with rooms, bookings, reviews collections
- Calculate statistics

### 2. Backend Route (manager.routes.js)
- Add `GET /api/managers/dashboard-data` endpoint
- Protected route (manager role required)

### 3. Redux Slice (managerSlice.js)
- Add `fetchManagerDashboardData` async thunk
- Add state properties for dashboard data

### 4. Frontend Component (ManagerDashboard.jsx)
- Use new API endpoint to fetch all data
- Simplify data handling

