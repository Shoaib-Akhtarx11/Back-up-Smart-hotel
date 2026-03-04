
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createBooking } from "../redux/bookingSlice";
import { createPayment } from "../redux/paymentSlice";
import { selectAllHotels } from "../redux/hotelSlice";
import { selectRoomsByHotel } from "../redux/roomSlice";
import { fetchUserLoyalty, selectRedemptionPoints } from "../redux/loyaltySlice";
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
  const redemptionPointsBalance = useSelector(selectRedemptionPoints);

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingSummary, setBookingSummary] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [redemptionPointsUsed, setRedemptionPointsUsed] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserLoyalty());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isAuthenticated) {
      navigate("/login", { 
        state: { redirectTo: `/booking/${hotelId}/${roomId}`, message: "Please login to book a hotel" } 
      });
    }
  }, [isAuthenticated, hotelId, roomId, navigate]);

  useEffect(() => {
    try {
      const foundHotel = allHotels.find((h) => String(h._id) === String(hotelId));
      const foundRoom = roomsByHotel.find((r) => String(r._id) === String(roomId));

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
  }, [hotelId, roomId, allHotels.length, roomsByHotel.length, navigate]);

  const priceCalculation = useMemo(() => {
    if (!room) return { base: 0, tax: 0, total: 0 };
    const nights = bookingSummary?.nights || 1;
    const numberOfRooms = bookingSummary?.numberOfRooms || 1;
    const base = room.Price * nights * numberOfRooms;
    const tax = base * 0.12;
    const redemptionDiscount = redemptionPointsUsed;
    const total = base + tax - redemptionDiscount;
    return { base, tax, total: total > 0 ? total : 0, numberOfRooms, nights, redemptionDiscount };
  }, [room, bookingSummary, redemptionPointsUsed]);

  const handleFormSubmit = useCallback((formData) => {
    setBookingSummary(formData);
    if (formData.isDraft === false) {
      setShowPayment(true);
    }
  }, []);

  const handleRedemptionChange = useCallback((points) => {
    setRedemptionPointsUsed(points);
  }, []);

  const handlePaymentConfirm = useCallback(async (usedRedemptionPoints = 0) => {
    try {
      setShowPayment(false);
      const pointsToEarn = Math.floor(priceCalculation.total / 100);
      const userId = currentUser?._id;

      const checkInDate = bookingSummary.checkIn instanceof Date 
        ? bookingSummary.checkIn.toISOString() 
        : String(bookingSummary.checkIn);
      const checkOutDate = bookingSummary.checkOut instanceof Date 
        ? bookingSummary.checkOut.toISOString() 
        : String(bookingSummary.checkOut);

      const redemptionDiscount = usedRedemptionPoints;

      const newBooking = {
        UserID: userId,
        RoomID: room._id,
        HotelID: hotel._id,
        NumberOfRooms: bookingSummary.numberOfRooms || 1,
        CheckInDate: checkInDate,
        CheckOutDate: checkOutDate,
        CheckInTime: bookingSummary.checkInTime || '14:00',
        CheckOutTime: bookingSummary.checkOutTime || '11:00',
        RedemptionPointsUsed: usedRedemptionPoints,
        RedemptionDiscountAmount: redemptionDiscount
      };

      const bookingResult = await dispatch(createBooking(newBooking)).unwrap();
      const savedBookingId = bookingResult._id;

      const paymentMethodNames = {
        'card': 'Credit/Debit Card',
        'bank': 'Bank Transfer',
        'upi': 'UPI',
        'netbanking': 'Net Banking'
      };
      const paymentMethodName = paymentMethodNames[selectedPaymentMethod] || 'Credit/Debit Card';
      
      const paymentResult = await dispatch(createPayment({
        BookingID: savedBookingId,
        UserID: userId,
        Amount: priceCalculation.total,
        Status: 'paid',
        PaymentMethod: paymentMethodName
      })).unwrap();

      navigate("/booking-success", {
        replace: true,
        state: {
          bookingData: {
            bookingId: savedBookingId,
            paymentId: paymentResult._id,
            hotelName: hotel.name,
            roomType: room.type,
            userName: currentUser?.Name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim(),
            userEmail: currentUser?.email,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            checkInTime: bookingSummary.checkInTime || '14:00',
            checkOutTime: bookingSummary.checkOutTime || '11:00',
            nights: bookingSummary.nights || 1,
            numberOfRooms: bookingSummary.numberOfRooms || 1,
            totalAmount: priceCalculation.total,
            pointsEarned: pointsToEarn,
            redemptionPointsUsed: usedRedemptionPoints,
            redemptionDiscount: redemptionDiscount
          }
        }
      });
    } catch (error) {
      console.error("Post-payment processing failed:", error);
      navigate("/error", { state: { message: "Payment processed, but we couldn't save your booking." } });
    }
  }, [bookingSummary, priceCalculation, hotel, room, currentUser, dispatch, navigate, selectedPaymentMethod, redemptionPointsUsed]);

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
                  user={currentUser}
                  initialEmail={currentUser?.email}
                  onSubmit={handleFormSubmit}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 position-sticky" style={{ top: '20px' }}>
              <div className="card-body">
                <h5 className="fw-bold mb-3">Booking Summary</h5>
                {hotel && <p className="mb-2"><strong>{hotel.name}</strong></p>}
                {room && <p className="text-muted mb-3">{room.type}</p>}
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span>₹{room?.Price.toLocaleString()} x {bookingSummary?.nights || 1} nights x {priceCalculation.numberOfRooms || 1} rooms:</span>
                  <span>₹{priceCalculation.base.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>Tax (12%):</span>
                  <span>₹{priceCalculation.tax.toLocaleString()}</span>
                </div>
                {redemptionPointsUsed > 0 && (
                  <div className="d-flex justify-content-between mb-3 text-success">
                    <span>Redemption Discount:</span>
                    <span>-₹{redemptionPointsUsed.toLocaleString()}</span>
                  </div>
                )}
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
        onMethodSelect={setSelectedPaymentMethod}
        redemptionPointsBalance={redemptionPointsBalance}
        onRedemptionChange={handleRedemptionChange}
      />
      <Footer />
    </div>
  );
};

export default BookingPage;

