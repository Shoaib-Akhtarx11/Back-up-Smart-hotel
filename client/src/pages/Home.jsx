import NavBar from "../components/layout/NavBar"
import Hero from "../components/features/home/Hero"
import Features from "../components/features/home/Features"
import HotelPreview from "../components/features/home/HotelPreview"
import Footer from "../components/layout/Footer"
import hotelsImage from "../assets/hotels.png"

const Home = () => {
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
