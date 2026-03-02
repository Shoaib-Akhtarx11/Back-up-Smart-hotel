/**
 * Auto-generate a new manager for hotels
 * Managers are assigned 1-3 hotels each
 */

export const generateNewManager = () => {
  // Get existing managers
  const storedUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
  const managers = storedUsers.filter(u => u.role === 'manager');
  
  // Generate new manager ID (starting from 2007 onwards)
  const maxId = managers.reduce((max, m) => Math.max(max, parseInt(m.id) || 0), 2006);
  const newManagerId = maxId + 1;
  
  // Generate unique email and password
  const timestamp = Date.now();
  const managerNumber = managers.length + 1;
  
  const newManager = {
    id: newManagerId,
    name: `Hotel Manager ${managerNumber}`,
    email: `manager${newManagerId}@resort.com`,
    password: `manager${newManagerId}@123`, // Auto-generated password
    role: 'manager',
    contactNumber: `+91 80000 ${String(newManagerId).slice(-5)}`
  };
  
  // Save to localStorage
  storedUsers.push(newManager);
  localStorage.setItem('allUsers', JSON.stringify(storedUsers));
  
  return newManager;
};

/**
 * Get manager assigned to the current logged-in user
 * If admin is trying to select managers, get from dropdown
 */
export const getManagerForHotel = (selectedManagerId = null) => {
  if (selectedManagerId) {
    return selectedManagerId;
  }
  // If manager is adding hotel, use their own ID
  return null;
};

/**
 * Count hotels assigned to a manager
 */
export const countManagerHotels = (managerId) => {
  const allHotels = JSON.parse(localStorage.getItem('allHotels') || '[]');
  return allHotels.filter(h => h.managerId == managerId).length;
};

/**
 * Auto-assign manager to hotel if admin doesn't select one
 * Balance the load by assigning to manager with least hotels
 */
export const autoAssignManager = () => {
  const storedUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
  let managers = storedUsers.filter(u => u.role === 'manager');
  
  if (managers.length === 0) {
    // No managers exist, create one
    return generateNewManager().id;
  }
  
  // Find manager with least hotels assigned (max 3)
  const managerLoads = managers.map(m => ({
    id: m.id,
    hotelCount: countManagerHotels(m.id)
  }));
  
  // Sort by hotel count and pick the one with least
  const leastLoadedManager = managerLoads
    .sort((a, b) => a.hotelCount - b.hotelCount)
    .find(m => m.hotelCount < 3);
  
  if (leastLoadedManager) {
    return leastLoadedManager.id;
  }
  
  // All existing managers have 3 hotels, create a new one
  return generateNewManager().id;
};
