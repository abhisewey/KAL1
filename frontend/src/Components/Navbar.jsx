import React from "react";
import { useNavigate } from "react-router-dom";
// import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h1 className="logo">KALI</h1>
      </div>

      <div className="nav-right">
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
