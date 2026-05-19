import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Menu, X, User, LogIn, UserPlus } from "lucide-react";
import "./Navbar.css";

/**
 * Safely decodes a JWT payload to extract user metadata
 * without requiring heavy external dependencies.
 */
const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  // Re-verify authentication details when page location or token changes
  useEffect(() => {
    if (token) {
      const decoded = getUserFromToken(token);
      setUser(decoded);
    } else {
      setUser(null);
    }
  }, [token, location]);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/"); // Navigate back to authentication landing page
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar-container">
        {/* LOGO */}
        <NavLink to={token ? "/home" : "/"} className="navbar-logo" aria-label="KALI Home">
          KALI<span className="logo-dot">.</span>
        </NavLink>

        {/* NAVIGATION LINKS (DESKTOP) */}
        <ul className="navbar-menu">
          <li>
            <NavLink 
              to="/home" 
              className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/venues" 
              className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
            >
              Venues
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/games" 
              className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
            >
              Games
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/community" 
              className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
            >
              Community
            </NavLink>
          </li>
        </ul>

        {/* ACTIONS / PROFILE (DESKTOP) */}
        <div className="navbar-actions">
          {token ? (
            <div className="navbar-profile-group">
              <div className="navbar-profile" title={user?.email || "User Profile"}>
                <div className="avatar-wrapper">
                  {user?.profilePicUrl ? (
                    <img src={user.profilePicUrl} alt="Avatar" className="user-avatar" />
                  ) : (
                    <User size={18} className="user-avatar-placeholder" />
                  )}
                </div>
                <span className="user-name">{user?.username || "Athlete"}</span>
              </div>
              <button className="logout-btn" onClick={logout} aria-label="Logout from KALI">
                <span>Logout</span>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="navbar-auth-buttons">
              <button className="auth-btn auth-btn--login" onClick={() => navigate("/")}>
                <LogIn size={16} />
                <span>Login</span>
              </button>
              <button className="auth-btn auth-btn--signup" onClick={() => navigate("/")}>
                <UserPlus size={16} />
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button 
          className={`navbar-hamburger ${isOpen ? "open" : ""}`} 
          onClick={toggleMenu} 
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div className={`navbar-mobile ${isOpen ? "open" : ""}`}>
        <ul className="navbar-mobile-menu">
          {[
            { to: "/home", label: "Home" },
            { to: "/venues", label: "Venues" },
            { to: "/games", label: "Games" },
            { to: "/community", label: "Community" }
          ].map((link, index) => (
            <li key={link.to} style={{ "--item-index": index }}>
              <NavLink 
                to={link.to} 
                className={({ isActive }) => `navbar-mobile-link ${isActive ? "active" : ""}`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          
          {token ? (
            <>
              <li className="mobile-profile-wrapper" style={{ "--item-index": 4 }}>
                <div className="navbar-profile">
                  <div className="avatar-wrapper">
                    {user?.profilePicUrl ? (
                      <img src={user.profilePicUrl} alt="Avatar" className="user-avatar" />
                    ) : (
                      <User size={20} className="user-avatar-placeholder" />
                    )}
                  </div>
                  <span className="user-name">{user?.username || "Athlete"}</span>
                </div>
              </li>
              <li className="mobile-logout-wrapper" style={{ "--item-index": 5 }}>
                <button className="logout-btn mobile-logout-btn" onClick={logout} aria-label="Logout from KALI">
                  <span>Logout</span>
                  <LogOut size={18} />
                </button>
              </li>
            </>
          ) : (
            <li className="mobile-auth-wrapper" style={{ "--item-index": 4 }}>
              <div className="navbar-auth-buttons mobile-auth-buttons">
                <button className="auth-btn auth-btn--login mobile-auth-btn" onClick={() => { setIsOpen(false); navigate("/"); }}>
                  <LogIn size={18} />
                  <span>Login</span>
                </button>
                <button className="auth-btn auth-btn--signup mobile-auth-btn" onClick={() => { setIsOpen(false); navigate("/"); }}>
                  <UserPlus size={18} />
                  <span>Sign Up</span>
                </button>
              </div>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
