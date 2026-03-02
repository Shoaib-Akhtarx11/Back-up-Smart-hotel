import { useState } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (email.trim()) {
      alert("Subscribed");
      setEmail(""); // This clears the input field after the user subscribes
    } else {
      alert("Please enter email id");
    }
  };

  return (
    <footer className="bg-white pt-4 pt-md-5 pb-4 mt-5 border-top">
      <div className="container-fluid px-3 px-md-4">
        <div className="row g-3 g-md-4 justify-content-between">
          {/* Brand Section */}
          <div className="col-12 col-md-6 col-lg-4">
            <a href="#" className="text-decoration-none">
              <h4 className="fw-bold text-dark mb-3">CheckIn</h4>
            </a>
            <p className="text-secondary small" style={{ maxWidth: "300px" }}>
              Your one-stop destination for comparing hotel prices from over
              100+ sites. Save big on your next booking with us.
            </p>
            <div className="d-flex gap-3 mt-4">
              <a href="#" className="text-secondary hover-dark transition-all">
                <FaFacebook size={18} />
              </a>
              <a href="#" className="text-secondary hover-dark transition-all">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="text-secondary hover-dark transition-all">
                <FaInstagram size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/gxndh1/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover-dark transition-all"
              >
                <FaLinkedin size={18} />
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="fw-bold mb-3 text-dark font-size-sm">Company</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none small"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none small"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none small"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none small"
                >
                  Press
                </a>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="fw-bold mb-3 text-dark font-size-sm">Support</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none small"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none small"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none small"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none small"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="col-12 col-md-12 col-lg-3">
            <h6 className="fw-bold mb-3 text-dark">Get Updates</h6>
            <p className="text-secondary small mb-3">
              Subscribe to our newsletter for the best deals.
            </p>
            <div className="input-group">
              <input
                type="email"
                className="form-control border-light bg-light rounded-start-4 shadow-sm"
                placeholder="Email address"
                style={{ fontSize: "14px" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="btn btn-dark rounded-end-4 px-3 shadow-sm"
                type="button"
                onClick={handleSubscribe}
              >
                Subscribe
              </button>
            </div>

            {/* Credit Section */}
            <div className="mt-3 p-2 border rounded-2 bg-light">
              <p className="fw-bold text-dark mb-1 small">Developed by</p>
              <div className="d-flex flex-column gap-0">
                <span className="text-secondary" style={{ fontSize: "11px" }}>
                  Animesh Gandhi
                </span>
                <span className="text-secondary" style={{ fontSize: "11px" }}>
                  Shoaib Akhtar
                </span>
                <span className="text-secondary" style={{ fontSize: "11px" }}>
                  Harsh Somnath Bhorde
                </span>
                <span className="text-secondary" style={{ fontSize: "11px" }}>
                  Souvik Hazra
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-top mt-4 mt-md-5 pt-4">
          <div className="row align-items-center">
            <div className="col-12 text-center">
              <p className="text-secondary small mb-0">
                &copy; {new Date().getFullYear()} CheckIn. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
