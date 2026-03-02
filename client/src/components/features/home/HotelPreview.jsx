import { FaCheck } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function HotelPreview() {
  const navigate = useNavigate();

  // Grab hotels and query from Redux
  const { allHotels, searchQuery } = useSelector((state) => state.hotels);
  const allRooms = useSelector((state) => state.rooms?.allRooms || []);

  // Function to get minimum room price for a hotel
  const getMinPrice = (hotelId) => {
    const hotelRooms = allRooms.filter((room) => room.hotelId === hotelId);
    if (hotelRooms.length === 0) return null;
    const minPrice = Math.min(...hotelRooms.map((room) => room.price));
    return minPrice;
  };

  // Filter logic
  const filteredHotels = allHotels.filter((hotel) => {
    // We convert everything to a string first to prevent crashes
    const hotelLocation = hotel?.location?.toLowerCase() || "";
    const hotelName = hotel?.name?.toLowerCase() || "";
    const query = searchQuery?.toLowerCase() || "";

    return hotelLocation.includes(query) || hotelName.includes(query);
  });

  const previewHotels = filteredHotels.slice(0, 4);

  return (
    // Use a standard Bootstrap container to handle alignment automatically
    <div className="container mt-5 hotel-preview-wrapper">
      {/* Header Section: Aligned with the container edges */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          {searchQuery
            ? `Deals in "${searchQuery}"`
            : "Hot hotel deals right now"}
        </h3>
        <Link
          to="/hotelList"
          className="btn btn-outline-dark fw-bold rounded-2 px-3 py-2"
          style={{ fontSize: "0.85rem" }}
        >
          See more deals →
        </Link>
      </div>

      {/* Grid Section: Using Bootstrap Row/Col for perfect alignment */}
      <div className="row g-3 justify-content-center">
        {previewHotels.length > 0 ? (
          previewHotels.map((hotel) => (
            <div
              key={hotel.id}
              className="col-12 col-sm-6 col-lg-3 d-flex justify-content-center"
            >
              <div
                className="card border-0 rounded-4 shadow-sm w-100 hotel-card"
                style={{ maxWidth: "280px" }}
              >
                <div className="position-relative">
                  <img
                    src={hotel.image}
                    className="card-img-top rounded-top-4"
                    alt={hotel.name}
                    style={{ height: "160px", objectFit: "cover" }}
                  />
                </div>

                <div className="card-body d-flex flex-column p-3">
                  <h5 className="card-title fw-bold mb-1 fs-6 text-truncate">
                    {hotel.name}
                  </h5>
                  <p className="card-text text-secondary small mb-2">
                    {hotel.location}
                  </p>

                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="badge bg-success rounded-pill">
                      {hotel.rating}
                    </span>
                    <span className="fw-bold small">{hotel.tag}</span>
                    <span className="text-secondary small">
                      ({hotel.reviewsCount || 0})
                    </span>
                  </div>

                  {/* Price and Features Box */}
                  <div className="mt-auto border rounded-3 p-2 bg-light-subtle">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small fw-bold">Best Deal</span>
                      <div
                        className="text-success d-flex align-items-center gap-1"
                        style={{ fontSize: "12px" }}
                      >
                        <FaCheck size={10} />{" "}
                        {hotel.features?.[0] || "Verified"}
                      </div>
                    </div>

                    <h4 className="fw-bold mb-0 fs-5">
                      ₹{getMinPrice(hotel.id)?.toLocaleString() || "N/A"}
                    </h4>
                    <span
                      className="text-secondary"
                      style={{ fontSize: "11px" }}
                    >
                      per night
                    </span>
                  </div>

                  <button
                    className="btn btn-primary w-100 mt-3 fw-bold py-2 rounded-3"
                    onClick={() => navigate(`/hotel/${hotel.id}`)}
                  >
                    Check deal ›
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5 border rounded-4 bg-light">
            <h5 className="text-dark">No hotels found in "{searchQuery}"</h5>
            <p className="text-muted">
              Try searching for another city or landmark.
            </p>
            <button
              className="btn btn-sm btn-dark"
              onClick={() => window.location.reload()}
            >
              Reset Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HotelPreview;
