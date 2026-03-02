import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserFriends,
} from "react-icons/fa";
import hotelsImage from "../../../assets/hotels.png";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setGlobalFilters } from "../../../redux/hotelSlice";
import  hotelBackgroundImage  from "../../../assets/HotelBackgroundImg.png";
import NavBar from "../../layout/NavBar";

const Hero = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [location, setLocation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Safety: Fallback to empty object if state isn't loaded
  const currentFilters = useSelector((state) => state.hotels?.filters || {});

  const handleSearch = (e) => {
    e.preventDefault();

    try {
      // 1. Validate that user has provided at least location input
      if (location.trim() === "") {
        setErrorMessage("Please fill the location");
        return;
      }

      // Clear error message on successful search
      setErrorMessage("");

      // 2. Prepare search location
      const searchLocation = location.trim();

      // 3. Dispatch updated filters to Redux
      // We merge the new location with existing filters (price, sortBy, etc.)
      dispatch(
        setGlobalFilters({
          ...currentFilters,
          location: searchLocation,
        }),
      );

      // 4. Attempt Navigation to the results page
      navigate("/hotelList");
    } catch (error) {
      console.error("Search Submission Error:", error);
      setErrorMessage(
        "We couldn't process your search at this time. Please try again.",
      );
    }
  };

  return (
    <div 
      className="hero-section d-flex align-items-center justify-content-center text-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${hotelBackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        position: "relative",
      }}
    >
            {/* NavBar inside background */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 100 }}>
              <NavBar isHomePage={true} />
            </div>

      <div
        className="container d-flex flex-column align-items-center"
        style={{
          maxWidth: "100%",
          zIndex: 1,
                  paddingTop: "80px",
        }}
      >
        <h1
          className="text-light mb-2 fw-bold animate__animated animate__fadeInDown"
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)"
          }}
        >
          Get 50% off on 1st booking
        </h1>
        <p className="lead text-light mb-5 animate__animated animate__fadeInUp" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)" }}>
          We compare hotel prices from over 100 sites
        </p>

        {/* Error Message Display */}
        {errorMessage && (
          <div
            className="alert alert-danger alert-dismissible fade show mb-4 animate__animated animate__fadeIn"
            role="alert"
            style={{ maxWidth: "900px", width: "100%" }}
          >
            <strong>Error:</strong> {errorMessage}
            <button
              type="button"
              className="btn-close"
              onClick={() => setErrorMessage("")}
            ></button>
          </div>
        )}

        <form
          onSubmit={handleSearch}
          className="search-bar bg-white p-2 rounded-pill shadow-lg d-flex align-items-center fade-in-section"
          style={{ maxWidth: "900px", width: "100%", border: "1px solid #eee" }}
        >
          {/* Location Input */}
          <div
            className="d-flex align-items-center px-4 py-2 border-end flex-grow-1"
            style={{ flexBasis: "30%" }}
          >
            <FaMapMarkerAlt className="text-secondary fs-5 me-3" />
            <div className="text-start w-100">
              <label
                className="d-block small fw-bold text-dark mb-0"
                style={{ fontSize: "11px" }}
              >
                Location
              </label>
              <input
                type="text"
                className="form-control border-0 p-0 shadow-none bg-transparent"
                placeholder="Where are you going?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ fontSize: "14px" }}
              />
            </div>
          </div>

          {/* Date Picker */}
          <div
            className="d-flex align-items-center px-4 py-2 border-end flex-grow-1"
            style={{ flexBasis: "35%" }}
          >
            <FaCalendarAlt className="text-secondary fs-5 me-3" />
            <div className="text-start w-100">
              <label
                className="d-block small fw-bold text-dark mb-0"
                style={{ fontSize: "11px" }}
              >
                Check in - Check out
              </label>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                isClearable={true}
                placeholderText="Add dates"
                className="form-control border-0 p-0 shadow-none bg-transparent"
                dateFormat="dd/MM/yy"
              />
            </div>
          </div>

          {/* Guests Input */}
          <div
            className="d-flex align-items-center px-4 py-2 flex-grow-1 d-none d-md-flex"
            style={{ flexBasis: "20%" }}
          >
            <FaUserFriends className="text-secondary fs-5 me-3" />
            <div className="text-start">
              <label
                className="d-block small fw-bold text-dark mb-0"
                style={{ fontSize: "11px" }}
              >
                Guests
              </label>
              <input
                type="text"
                className="form-control border-0 p-0 shadow-none bg-transparent"
                placeholder="Add guests"
                style={{ fontSize: "14px" }}
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="btn btn-dark text-white rounded-pill px-4 py-3 d-flex align-items-center justify-content-center gap-2 shadow-sm"
            style={{ minWidth: "140px", height: "55px" }}
          >
            <FaSearch className="fs-6" />
            <span className="fw-bold">Search</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Hero;
