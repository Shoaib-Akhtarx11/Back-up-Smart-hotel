import React from "react";
import { useDispatch } from "react-redux";
import { FaTrash, FaEdit } from "react-icons/fa";

const UserManagementTable = ({ users, type }) => {
  const dispatch = useDispatch();

  // Helper to safely get user data with case-insensitive field names
  const getField = (user, field) => {
    const lowerField = field.toLowerCase();
    // Try lowercase first
    if (user[lowerField] !== undefined) return user[lowerField];
    // Try PascalCase
    if (user[field] !== undefined) return user[field];
    return '';
  };

  const getId = (user) => getField(user, 'id') || user._id || user.UserID || '';
  const getName = (user) => getField(user, 'name') || user.Name || '';
  const getEmail = (user) => getField(user, 'email') || user.Email || '';

  const handleEdit = (user) => {
    alert(`Edit feature for ${getName(user)} - Updates will be shown as alert messages`);
  };

  const handleDelete = (user) => {
    const name = getName(user);
    const id = getId(user);
    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${name} from the database? This action is permanent.`
    );
    
    if (confirmDelete) {
      try {
        // TODO: Implement user deletion via backend API
        // dispatch(deleteUser(id));
        alert(`${name} has been removed from the system`);
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("An error occurred while trying to remove the user.");
      }
    }
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle border-0">
          <thead className="table-light">
            <tr className="text-secondary small text-uppercase">
              <th className="py-3 px-4">ID</th>
              <th className="py-3">Name</th>
              <th className="py-3">Email</th>
              <th className="py-3">{type === "manager" ? "Role" : "Loyalty Points"}</th>
              <th className="py-3">Status</th>
              <th className="py-3 text-end px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={getId(user)} className="border-bottom">
                  <td className="px-4 fw-bold text-muted">#{getId(user)}</td>
                  <td>
                    <div className="fw-bold">{getName(user)}</div>
                    <div className="small text-muted d-md-none">{getEmail(user)}</div>
                  </td>
                  <td className="text-muted d-none d-md-table-cell">{getEmail(user)}</td>
                  <td>
                    {type === "manager" ? (
                      <span className="badge bg-info-subtle text-info border border-info-subtle px-3 rounded-pill">
                        Manager
                      </span>
                    ) : (
                      <span className="fw-bold text-primary bg-primary-subtle px-3 py-1 rounded-pill small">
                        {/* Safety: Matching your PointsBalance PascalCase */}
                        {(user.loyalty?.PointsBalance ?? 0).toLocaleString()} pts
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2">
                      Active
                    </span>
                  </td>
                  <td className="px-4">
                    <div className="d-flex gap-2 justify-content-end">
                      <button 
                        className="btn btn-sm btn-light border" 
                        title="Edit User"
                        onClick={() => handleEdit(user)}
                      >
                        <FaEdit className="text-primary" />
                      </button>
                      <button 
                        className="btn btn-sm btn-light border" 
                        title="Delete User"
                        onClick={() => handleDelete(user)}
                      >
                        <FaTrash className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-5">
                  <div className="text-muted">
                    <i className="bi bi-person-x display-4 d-block mb-2"></i>
                    No {type}s found in the database.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
};

export default UserManagementTable;
