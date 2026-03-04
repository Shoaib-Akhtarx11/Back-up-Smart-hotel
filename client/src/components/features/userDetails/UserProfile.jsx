import React from "react";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaCalendarAlt } from "react-icons/fa";

const UserProfile = ({ 
  currentUser, 
  isEditMode, 
  setIsEditMode, 
  formData, 
  handleInputChange, 
  handleSaveProfile,
  editSuccess,
  loading = false
}) => {
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
              <FaUser className="text-primary fs-4" />
            </div>
            <div>
              <h4 className="fw-bold mb-0">Profile Information</h4>
              <p className="text-muted small mb-0">Manage your personal details</p>
            </div>
          </div>
          {!isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="btn btn-outline-primary btn-sm rounded-pill px-3"
            >
              <FaEdit className="me-2" />
              Edit Profile
            </button>
          )}
        </div>

        {editSuccess && (
          <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
            <strong><FaSave className="me-2" />Success!</strong> Your profile has been updated.
            <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
          </div>
        )}

        {isEditMode ? (
          <form className="animate__animated animate__fadeIn">
            <div className="row g-4">
              <div className="col-12">
                <div className="form-floating">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control rounded-3"
                    id="nameInput"
                    placeholder="Full Name"
                  />
                  <label htmlFor="nameInput" className="fw-bold small text-muted">Full Name</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control rounded-3"
                    id="emailInput"
                    placeholder="Email"
                    disabled
                  />
                  <label htmlFor="emailInput" className="fw-bold small text-muted">Email</label>
                  <small className="text-muted">Email cannot be changed</small>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-control rounded-3"
                    id="phoneInput"
                    placeholder="Phone"
                  />
                  <label htmlFor="phoneInput" className="fw-bold small text-muted">Phone Number</label>
                </div>
              </div>
              <div className="col-12">
                <div className="form-floating">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-control rounded-3"
                    id="addressInput"
                    placeholder="Address"
                  />
                  <label htmlFor="addressInput" className="fw-bold small text-muted">Address</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="form-control rounded-3"
                    id="cityInput"
                    placeholder="City"
                  />
                  <label htmlFor="cityInput" className="fw-bold small text-muted">City</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="form-control rounded-3"
                    id="countryInput"
                    placeholder="Country"
                  />
                  <label htmlFor="countryInput" className="fw-bold small text-muted">Country</label>
                </div>
              </div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="btn btn-primary rounded-pill px-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="btn btn-outline-secondary rounded-pill px-4"
                disabled={loading}
              >
                <FaTimes className="me-2" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                  <FaUser className="text-primary" />
                </div>
                <label className="fw-bold small text-muted mb-0">Full Name</label>
              </div>
              <p className="ms-5 fw-bold text-dark">{currentUser?.name || currentUser?.Name || 'N/A'}</p>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                  <FaEnvelope className="text-primary" />
                </div>
                <label className="fw-bold small text-muted mb-0">Email Address</label>
              </div>
              <p className="ms-5 fw-bold text-dark">{currentUser?.email || currentUser?.Email || 'N/A'}</p>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                  <FaPhone className="text-primary" />
                </div>
                <label className="fw-bold small text-muted mb-0">Phone Number</label>
              </div>
              <p className="ms-5 fw-bold text-dark">{currentUser?.phone || currentUser?.ContactNumber || "Not provided"}</p>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                  <FaMapMarkerAlt className="text-primary" />
                </div>
                <label className="fw-bold small text-muted mb-0">Address</label>
              </div>
              <p className="ms-5 fw-bold text-dark">
                {currentUser?.address || currentUser?.Address || "Not provided"}
              </p>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                  <FaMapMarkerAlt className="text-primary" />
                </div>
                <label className="fw-bold small text-muted mb-0">Location</label>
              </div>
              <p className="ms-5 fw-bold text-dark">
                {currentUser?.city || currentUser?.City || "Not provided"}
                {(currentUser?.city || currentUser?.City) && (currentUser?.country || currentUser?.Country) ? ", " : ""}
                {currentUser?.country || currentUser?.Country || ""}
              </p>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                  <FaCalendarAlt className="text-primary" />
                </div>
                <label className="fw-bold small text-muted mb-0">Account Created</label>
              </div>
              <p className="ms-5 fw-bold text-dark">
                {currentUser?.createdAt ? formatDate(currentUser.createdAt) : "N/A"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

