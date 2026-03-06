import React from "react";
import { FaTrash, FaEdit, FaUserShield } from "react-icons/fa";

const UserManagementTable = ({ users, type, onDelete, onRoleChange }) => {
  // Helper to safely get user data
  const getId = (user) => user._id || user.id || user.UserID || '';
  const getName = (user) => user.Name || user.name || '';
  const getEmail = (user) => user.Email || user.email || '';
  const getRole = (user) => user.Role || user.role || 'guest';

  const handleRoleChange = (userId, newRole) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      onRoleChange(userId, newRole);
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
            <th className="py-3">Role</th>
            <th className="py-3">Bookings</th>
            <th className="py-3">Joined</th>
            <th className="py-3 text-end px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={getId(user)} className="border-bottom">
                <td className="px-4 fw-bold text-muted">#{getId(user).slice(-6)}</td>
                <td>
                  <div className="fw-bold">{getName(user)}</div>
                  <div className="small text-muted d-md-none">{getEmail(user)}</div>
                </td>
                <td className="text-muted d-none d-md-table-cell">{getEmail(user)}</td>
                <td>
                  {type === "admin" ? (
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 rounded-pill">
                      <FaUserShield className="me-1" />
                      Admin
                    </span>
                  ) : type === "manager" ? (
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 rounded-pill">
                      Manager
                    </span>
                  ) : (
                    <span className="badge bg-info-subtle text-info border border-info-subtle px-3 rounded-pill">
                      Guest
                    </span>
                  )}
                </td>
                <td>
                  <span className="badge bg-primary-subtle text-primary px-3 py-1 rounded-pill">
                    {user.bookingCount || 0}
                  </span>
                </td>
                <td className="text-muted small">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </td>
                <td className="px-4">
                  <div className="d-flex gap-2 justify-content-end">
                    {/* Role Change Dropdown */}
                    {type !== "admin" && (
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-light border dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          title="Change Role"
                        >
                          <FaEdit className="text-primary" />
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleRoleChange(getId(user), 'guest')}
                            >
                              Set as Guest
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleRoleChange(getId(user), 'manager')}
                            >
                              Set as Manager
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleRoleChange(getId(user), 'admin')}
                            >
                              Set as Admin
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                    {/* Delete Button */}
                    {type !== "admin" && (
                      <button
                        className="btn btn-sm btn-light border"
                        title="Delete User"
                        onClick={() => onDelete(getId(user))}
                      >
                        <FaTrash className="text-danger" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-5">
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

