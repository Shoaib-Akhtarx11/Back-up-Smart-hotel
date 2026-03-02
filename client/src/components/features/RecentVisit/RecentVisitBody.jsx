import React from 'react';
import { useSelector } from 'react-redux';
import { Container } from 'react-bootstrap';
import HotelCard from '../hotellist/HotelCard';

const RecentViewedBody = () => {
    // Get recent visits from Redux (stores full hotel objects)
    const recentVisits = useSelector((state) => state.users?.recentVisits || []);

    return (
        <Container className="pt-2 ps-md-4">
            <div className="mb-4">
                <h2 className="fw-bold">Recently viewed</h2>
            </div>

            {/* Display actual recent visits or empty state */}
            <div className="d-flex flex-column gap-3" style={{ maxWidth: '850px' }}>
                {recentVisits.length > 0 ? (
                    recentVisits.map((hotel) => (
                        <HotelCard key={hotel.id} hotel={hotel} />
                    ))
                ) : (
                    <div className="text-center py-5 bg-light rounded-4 border">
                        <div className="fs-1 mb-3">🏨</div>
                        <h5 className="fw-bold">No recent views yet</h5>
                        <p className="text-muted mb-3">Hotels you view will appear here for easy access.</p>
                        <a href="/hotelList" className="btn btn-primary rounded-pill">
                            Browse Hotels
                        </a>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default RecentViewedBody;