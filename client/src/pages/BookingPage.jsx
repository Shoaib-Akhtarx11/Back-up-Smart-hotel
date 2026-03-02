import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addLoyaltyPoints } from "../redux/userSlice";
import { createBooking } from "../redux/bookingSlice";
import { recordPayment } from "../redux/paymentSlice";
import { updateRoomAvailability } from "../redux/roomSlice";
import { selectAllHotels } from "../redux/hotelSlice";
import { selectRoomsByHotel } from "../redux/roomSlice";
import { getUserBookings, saveUserBookings } from "../utils/userDataManager";
import BookingForm from "../components/features/booking/BookingForm";
import PaymentModal from "../components/features/booking/PaymentModal";
import NavBar from "../components/layout/NavBar";
import Footer from "../components/layout/Footer";

const BookingPage = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const allHotels = useSelector(selectAllHotels);
  const roomsByHotel = useSelector(selectRoomsByHotel(hotelId));
  const auth = useSelector((state) => state.auth || {});
  const currentUser = auth.user;
  const isAuthenticated = auth.isAuthenticated;

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingSummary, setBookingSummary] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // CHECK LOGIN PROTECTION - redirect early if not authenticated
    if (!isAuthenticated) {
      navigate("/login", { 
        state: { redirectTo: `/booking/${hotelId}/${roomId}`, message: "Please login to book a hotel" } 
      });
      return;
    }
  }, [isAuthenticated, hotelId, roomId, navigate]);

  // Separate effect for loading hotel and room data
  useEffect(() => {
    try {
      const foundHotel = allHotels.find((h) => String(h.id) === String(hotelId));
      const foundRoom = roomsByHotel.find((r) => String(r.id) === String(roomId));

      if (!foundHotel || !foundRoom) {
        navigate("/error", {
          state: { message: "The room or hotel you are trying to book is no longer available." },
        });
        return;
      }

      setHotel(foundHotel);
      setRoom(foundRoom);
      setLoading(false);
    } catch (err) {
      console.error("Booking initialization error:", err);
      navigate("/error", { state: { message: "Unable to initialize the secure booking environment." } });
    }
    // Only depend on IDs, not array references which get recreated
  }, [hotelId, roomId, allHotels.length, roomsByHotel.length, navigate]);

  const priceCalculation = useMemo(() => {
    if (!room) return { base: 0, tax: 0, total: 0 };
    const nights = bookingSummary?.nights || 1;
    const base = room.price * nights;
    const tax = base * 0.12;
    return { base, tax, total: base + tax };
  }, [room, bookingSummary]);

  const handleFormSubmit = useCallback((formData) => {
    setBookingSummary(formData);
    if (formData.isDraft === false) {
      setShowPayment(true);
    }
  }, []);

  const handlePaymentConfirm = useCallback(() => {
    try {
      setShowPayment(false);
      // 1 point per rupee of total booking amount
      const pointsToEarn = Math.floor(priceCalculation.total);
      const bookingId = `BK-${Date.now()}`;
      const userId = currentUser?.id;

      // Convert Date objects to ISO strings before dispatching
      const checkInDate = bookingSummary.checkIn instanceof Date 
        ? bookingSummary.checkIn.toISOString() 
        : String(bookingSummary.checkIn);
      const checkOutDate = bookingSummary.checkOut instanceof Date 
        ? bookingSummary.checkOut.toISOString() 
        : String(bookingSummary.checkOut);

      const newBooking = {
        id: bookingId,
        userId: userId,
        roomId: room.id,
        hotelId: hotel.id,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        status: 'Confirmed',
        guestDetails: {
          firstName: bookingSummary.firstName,
          lastName: bookingSummary.lastName,
          email: bookingSummary.email,
          phone: bookingSummary.phone
        },
        totalPrice: priceCalculation.total,
        loyaltyPointsEarned: pointsToEarn,
        guestName: `${bookingSummary.firstName} ${bookingSummary.lastName}`,
        email: bookingSummary.email,
        rooms: 1,
        createdAt: new Date().toISOString()
      };

      // Save booking to Redux (global state)
      dispatch(createBooking(newBooking));

      // IMPORTANT: Also save to user-specific localStorage
      if (userId) {
        const userBookings = getUserBookings(userId);
        userBookings.push(newBooking);
        saveUserBookings(userId, userBookings);
      }

      dispatch(recordPayment({
        bookingId: bookingId,
        userId: userId,
        amount: priceCalculation.total,
        paymentMethod: 'Card'
      }));

      dispatch(addLoyaltyPoints({
        points: pointsToEarn,
        activity: `Stay at ${hotel?.name}`,
        hotelName: hotel?.name,
        bookingId: bookingId,
        userId: userId,
      }));

      // Update room availability to mark it as booked
      dispatch(updateRoomAvailability({
        roomId: room.id,
        availability: false
      }));

      navigate("/loyalty", {
        replace: true,
        state: { successMessage: `Booking Successful! You've earned ${pointsToEarn.toLocaleString()} points.` },
      });
    } catch (error) {
      console.error("Post-payment processing failed:", error);
      navigate("/error", { state: { message: "Payment processed, but we couldn't save your booking." } });
    }
  }, [bookingSummary, priceCalculation, hotel, room, currentUser, dispatch, navigate]);

  if (loading) return <div className="text-center py-5 mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="bg-light min-vh-100">
      <NavBar />
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div className="bg-primary p-3 text-white">
                <h5 className="mb-0">Guest Information</h5>
              </div>
              <div className="p-4 bg-white">
                <BookingForm
                  hotel={hotel}
                  room={room}
                  initialEmail={currentUser?.email || ''}
                  onSubmit={handleFormSubmit}
                />
              </div>
            </div>

            {/* Reviews Section - REMOVED (Now in HotelDetails Page) */}
            {/* Reviews have been moved to the HotelDetails page for better UX */}
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 position-sticky" style={{ top: '20px' }}>
              <div className="card-body">
                <h5 className="fw-bold mb-3">Booking Summary</h5>
                {hotel && <p className="mb-2"><strong>{hotel.name}</strong></p>}
                {room && <p className="text-muted mb-3">{room.type}</p>}
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span>Base Price × {bookingSummary?.nights || 1} nights:</span>
                  <span>₹{priceCalculation.base.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>Tax (12%):</span>
                  <span>₹{priceCalculation.tax.toLocaleString()}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary">₹{priceCalculation.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal 
        show={showPayment}
        onHide={() => setShowPayment(false)}
        bookingDetails={priceCalculation}
        onConfirm={handlePaymentConfirm}
      />
      <Footer />
    </div>
  );
};

export default BookingPage;