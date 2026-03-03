import { useEffect } from "react"
import { useDispatch } from "react-redux"
import NavBar from "../components/layout/NavBar"
import Hero from "../components/features/home/Hero"
import Features from "../components/features/home/Features"
import HotelPreview from "../components/features/home/HotelPreview"
import Footer from "../components/layout/Footer"
import hotelsImage from "../assets/hotels.png"
import { fetchHotels } from "../redux/hotelSlice"
import { fetchRoomsByHotel } from "../redux/roomSlice"

const Home = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        // Fetch all hotels
        dispatch(fetchHotels())
        // Fetch all rooms for price display
        dispatch(fetchRoomsByHotel())
    }, [dispatch])

    return (
        <div>
            <Hero />
            {/* Hotels Partners Section */}
            <div className="py-5 text-center bg-light">
                <img
                    src={hotelsImage}
                    alt="Hotel Partners"
                    className="img-fluid"
                    style={{ maxWidth: "800px", width: "100%", opacity: 0.8 }}
                />
            </div>
            <Features />
            <HotelPreview />
            <Footer />
        </div>
    )
}

export default Home
