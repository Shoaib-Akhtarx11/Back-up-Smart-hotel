import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '../components/layout/NavBar';
import Footer from '../components/layout/Footer';

const Error = ({ message }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // This line captures the custom message we sent from BookingPage
    const displayMessage = location.state?.message || message || "An unexpected error occurred.";

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <NavBar />
            <main className="flex-grow-1 d-flex align-items-center">
                <div className="container text-center py-5">
                    <div className="mb-4">
                        <i className="bi bi-exclamation-octagon text-danger display-1"></i>
                    </div>
                    <h1 className="fw-bold text-dark mb-3">Something went wrong</h1>
                    <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '500px' }}>
                        {displayMessage}
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold"
                        >
                            Go Back
                        </button>
                        <button 
                            onClick={() => navigate('/')} 
                            className="btn btn-primary px-4 py-2 rounded-pill fw-bold"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Error;