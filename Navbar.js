import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css"; // Import CSS for styling

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo">The Daily Pulse 📡</span>
      </div>
      <div className="navbar-right">
        <button className="navbar-link" onClick={() => navigate("/about-us")}>
          About Us
        </button>
        <button className="navbar-link" onClick={() => navigate("/feedback")}>
          Feedback
        </button>
        <button className="navbar-link" onClick={() => navigate("/contact")}>
          Contact
        </button>
      </div>
    </nav>
  );
};

export default Navbar;