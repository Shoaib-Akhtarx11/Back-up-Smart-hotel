import React from 'react';
import { Nav } from 'react-bootstrap';
// Using generic icons that match your screenshot closely
import { FiChevronLeft, FiHeart, FiClock, FiBriefcase, FiHelpCircle } from "react-icons/fi";

const Sidebar = () => {
  return (
    <div className="d-flex flex-column p-3 bg-white h-100">
      <Nav className="flex-column gap-2">
        {/* Back Button */}
        <Nav.Link href="/" className="text-dark d-flex align-items-center gap-2 mb-4 fw-medium">
          <FiChevronLeft size={20} /> Back
        </Nav.Link>
        
        {/* Favorites */}
        <Nav.Link href="#" className="text-dark d-flex align-items-center gap-3 py-3 px-3">
          <FiHeart size={20} /> Favorites
        </Nav.Link>

        {/* Recently Viewed (Active State) */}
        <Nav.Link 
          href="#" 
          className="d-flex align-items-center gap-3 py-3 px-3 rounded-3"
          style={{ backgroundColor: '#eef6fc', color: '#005f99', fontWeight: 'bold' }}
        >
          <FiClock size={20} /> Recently viewed
        </Nav.Link>

        {/* Bookings */}
        <Nav.Link href="#" className="text-dark d-flex align-items-center gap-3 py-3 px-3">
          <FiBriefcase size={20} /> Bookings
        </Nav.Link>

        {/* Help - Added margin top to separate it like the image */}
        <Nav.Link href="#" className="text-dark d-flex align-items-center gap-3 py-3 px-3 mt-4">
          <FiHelpCircle size={20} /> Help and support
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;