import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectFilteredHotels, resetFilters } from "../redux/hotelSlice"; 
import HotelCard from "../components/features/hotellist/HotelCard"; 
import NavBar from "../components/layout/NavBar";
import FilterNav from "../components/features/hotelList/FilterNav";
import Footer from "../components/layout/Footer";

const HotelList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sortedHotels = useSelector(selectFilteredHotels);
  const filters = useSelector((state) => state.hotels?.filters || {});
  
  const handleClearFilters = () => {
    dispatch(resetFilters());
  };

  return (
    <div className="bg-light min-vh-100">
      <NavBar />
      
      {/* Search and Filter Navigation */}
      <FilterNav />
      
      <div className="container mt-4 mb-5">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-end mb-3 px-1">
          <div>
            <h4 className="fw-bold mb-0 text-dark">
              {filters.location !== "Any region" ? `Hotels in ${filters.location}` : "All Properties"}
            </h4>
            <p className="text-muted small mb-0">
              Found {sortedHotels.length} {sortedHotels.length === 1 ? 'property' : 'properties'} matching your criteria
            </p>
          </div>
        </div>

        {/* Results Grid */}
        <div className="row">
          <div className="col-12">
            {sortedHotels.length > 0 ? (
              sortedHotels.map((hotel) => (
                <div key={hotel.id} className="mb-4 animate__animated animate__fadeIn">
                   {/* HotelCard now receives the hotel object which ALREADY includes .minPrice */}
                   <HotelCard hotel={hotel} />
                </div>
              ))
            ) : (
              /* Empty State UI */
              <div className="text-center py-5 bg-white rounded-4 shadow-sm border mt-3">
                <div className="mb-4">
                  <i className="bi bi-search-heart display-1 text-muted opacity-50"></i>
                </div>
                <h5 className="fw-bold text-dark">No matches found</h5>
                <p className="text-muted mx-auto" style={{ maxWidth: '400px' }}>
                  We couldn't find any hotels matching your current filters for <strong>{filters.location}</strong>. 
                  Try adjusting the price range or features.
                </p>
                <button 
                  className="btn btn-dark rounded-pill px-4 mt-3"
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HotelList;