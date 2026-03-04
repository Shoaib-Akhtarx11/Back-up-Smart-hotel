import {FaHome,FaPhoneAlt,FaUser,FaUserCircle,FaCog,FaCalendarAlt,FaQuestionCircle,FaSignOutAlt,
} from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoMenu, IoClose } from "react-icons/io5";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";

const NavBar = ({ isHomePage = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // NEW: Local state to toggle the Profile/Account dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const role = user?.role || user?.Role || "guest";

  const handleLogout = () => {
    dispatch(logout());
    setIsDropdownOpen(false); // Close dropdown on logout
    navigate("/");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // NEW: Function to toggle the account dropdown
  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleListProperty = (e) => {
    e.preventDefault();
    if (isAuthenticated && role === "manager") {
      navigate("/manager");
    } else {
      navigate("/login");
    }
  };

  return (
    <div
      style={{  backgroundColor: !isHomePage ? "#212529e6" : "transparent",
        width: "100%",
      }}
    >
      <nav className="py-2 py-md-3 navbar-mobile-friendly">
        <div
          className={`${!isHomePage ? "w-100" : "container px-3 px-md-4"} d-flex justify-content-between align-items-center mx-auto`}
          style={{
            maxWidth: !isHomePage ? "100%" : "1200px",
            padding: !isHomePage ? "0 20px" : "0",
          }}
        >
          {/* Logo Section - Transparent Background */}
          <div
            className="logo-section"
            style={{
              padding: "0.5rem 0",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Link to="/" style={{ display: "flex", alignItems: "center" }}>
              <img
                src="/CheckInFinal.png"
                width={180}
                height={50}
                alt="Hotel Logo"
                className="navbar-logo"
                style={{
                  backgroundColor: "transparent",
                  display: "block",
                  objectFit: "contain",
                  marginLeft: "8px",
                  filter: "drop-shadow(0 1px 2px rgba(255,255,255,0.3))",
                }}
              />
            </Link>
          </div>
          {/* Hamburger Menu Button (Mobile) */}
          <button
            className="btn btn-link d-lg-none ms-auto"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <IoClose className="fs-4 text-light" />
            ) : (
              <IoMenu className="fs-4 text-light" />
            )}
          </button>

          {/* Navigation Links */}
          <div className={`navbar-links-container ${isMenuOpen ? "show" : ""}`}>
            <ul className="d-flex flex-column flex-lg-row justify-content-end align-items-lg-center gap-2 gap-lg-3 m-0 p-3 p-lg-0 list-unstyled">
              {/* List Your Property - Only for Managers */}
              {isAuthenticated && role === "manager" && (
                <li>
                  <a
                    href="#"
                    onClick={handleListProperty}
                    className="text-decoration-none text-dark fw-bold rounded-2 px-3 py-2 d-flex align-items-center gap-2"
                    style={{ backgroundColor: "#fff" }}
                  >
                    <FaHome /> <span>List Your Property</span>
                  </a>
                </li>
              )}
              {/* Call Us Button */}
              <li>
                <a
                  href="#"
                  className="text-decoration-none text-dark fw-bold rounded-2 px-3 py-2 d-flex align-items-center gap-2"
                  style={{ backgroundColor: "#fff" }}
                >
                  <FaPhoneAlt /> <span>Call Us</span>
                </a>
              </li>
              {/* Menu Dropdown - Authenticated Users */}
              {isAuthenticated && (
                <li className="position-relative">
                  <button
                    onClick={toggleDropdown}
                    className="text-dark fw-bold rounded-2 px-3 py-2 d-flex align-items-center gap-2 w-100"
                    style={{ backgroundColor: "#fff", border: "none" }}
                  >
                    <CgProfile /> <span>Menu</span>
                  </button>
                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      className="position-absolute bg-white border border-dark rounded-2 shadow p-2 mt-2"
                      style={{ width: "220px", right: 0, zIndex: 9999 }}
                    >
                      <ul className="list-unstyled m-0 p-0 text-start">
                        {/* Account Section */}
                        <li className="fw-bold px-2 pt-1 small text-muted">ACCOUNT</li>
                        {role !== "admin" && (
                          <li>
                            <Link
                              to="/account"
                              className="d-flex align-items-center gap-2 text-dark text-decoration-none py-1 px-2 rounded hover-bg-light"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <FaUser /> My Account
                            </Link>
                          </li>
                        )}
                        
                        {/* My Bookings Section - Only for guests */}
                        {role === "guest" && (
                          <>
                            <li className="fw-bold px-2 pt-2 small text-muted">MY BOOKINGS</li>
                            <li>
                              <Link
                                to="/account?tab=bookings"
                                className="d-flex align-items-center gap-2 text-dark text-decoration-none py-1 px-2 rounded hover-bg-light"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <FaCalendarAlt /> My Bookings
                              </Link>
                            </li>
                          </>
                        )}
                        
                        {/* My Points Section - Only for guests */}
                        {role === "guest" && (
                          <>
                            <li className="fw-bold px-2 pt-2 small text-muted">MY POINTS</li>
                            <li>
                              <Link
                                to="/account?tab=loyalty"
                                className="d-flex align-items-center gap-2 text-dark text-decoration-none py-1 px-2 rounded hover-bg-light"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <FaUserCircle /> Loyalty Points
                              </Link>
                            </li>
                          </>
                        )}
                        
                        {/* Manager Section */}
                        {role === "manager" && (
                          <>
                            <li className="fw-bold px-2 pt-2 small text-muted">DASHBOARD</li>
                            <li>
                              <Link
                                to="/manager"
                                className="d-flex align-items-center gap-2 text-dark text-decoration-none py-1 px-2 rounded hover-bg-light"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <FaCog /> Manager Dashboard
                              </Link>
                            </li>
                          </>
                        )}
                        
                        {/* Admin Section */}
                        {role === "admin" && (
                          <>
                            <li className="fw-bold px-2 pt-2 small text-muted">ADMIN</li>
                            <li>
                              <Link
                                to="/admin"
                                className="d-flex align-items-center gap-2 text-dark text-decoration-none py-1 px-2 rounded hover-bg-light"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <FaCog /> Admin Dashboard
                              </Link>
                            </li>
                          </>
                        )}
                        
                        <hr className="my-1" />
                        <li>
                          <a
                            href="#"
                            className="d-flex align-items-center gap-2 text-dark text-decoration-none py-1 px-2 rounded hover-bg-light"
                          >
                            <FaQuestionCircle /> Help Center
                          </a>
                        </li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="btn btn-link w-100 d-flex align-items-center gap-2 text-danger text-decoration-none py-1 px-2 rounded hover-bg-light border-0"
                          >
                            <FaSignOutAlt /> Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </li>
              )}

              {/* Login/Sign Up Button - Unauthenticated Users */}
              {!isAuthenticated && (
                <li>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-decoration-none text-dark fw-bold rounded-2 px-3 py-2 d-flex align-items-center gap-2"
                    style={{ backgroundColor: "#fff" }}
                  >
                    <FaUser /> <span>Login/Sign Up</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
