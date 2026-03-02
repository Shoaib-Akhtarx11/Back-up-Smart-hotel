import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/layout/NavBar';
import Sidebar from '../components/layout/Sidebar';
import RecentViewedBody from '../components/features/RecentVisit/RecentVisitBody';

const RecentVisit = () => {
  const navigate = useNavigate();

  try {
    return (
      <div className="bg-light min-vh-100">
        <NavBar />
        <Container fluid>
          <Row>
            {/* Sidebar Column */}
            <Col md={3} lg={2} className="p-0 border-end bg-white min-vh-100 d-none d-md-block shadow-sm">
              <Sidebar />
            </Col>

            {/* Main Content Column */}
            <Col xs={12} md={9} lg={10} className="p-4 p-lg-5">
              <div className="fade-in-section">
                <div className="mb-4">
                  <h2 className="fw-bold">Your Recent Journey</h2>
                  <p className="text-muted">Pick up exactly where you left off.</p>
                </div>
                
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <RecentViewedBody />
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  } catch (error) {
    console.error("RecentVisit Page Crash:", error);
    navigate("/error", { state: { message: "We couldn't retrieve your browsing history." } });
    return null;
  }
};

export default RecentVisit;