import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import './ProtectedRoute.css';

/**
 * Helper function to safely parse and validate a JWT token's expiration
 * without requiring any external dependencies (like jwt-decode).
 * 
 * @param {string} token - The JWT token to decode.
 * @returns {boolean} - Returns true if valid and unexpired, false otherwise.
 */
const isTokenValid = (token) => {
  if (!token) return false;

  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const base64Url = parts[1];
    
    // Decode base64 payload properly
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);

    // Check expiration (exp is in seconds, Date.now() is in milliseconds)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false; // Token expired
    }

    return true; // Token is structurally valid and not expired
  } catch (error) {
    console.error("ProtectedRoute: Invalid token format detected.", error);
    return false; // Unable to parse token, assume invalid
  }
};

/**
 * ProtectedRoute Component
 * 
 * Wraps authenticated routes to ensure the user possesses a valid JWT token.
 * Validates token existence and expiration. If invalid, it handles cleanup
 * and redirects immediately to the login/intro page.
 * 
 * Can be used as a standard wrapper or as a layout Route (renders <Outlet />).
 * 
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Child components (if wrapped).
 */
const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = () => {
      const token = localStorage.getItem('token'); 

      if (token && isTokenValid(token)) {
        setIsAuthenticated(true);
      } else {
        if (token) localStorage.removeItem('token');
        setIsAuthenticated(false);
      }

      // Add a tiny delay (300ms) to ensure smooth spinner rendering
      const timer = setTimeout(() => setIsChecking(false), 300);
      return () => clearTimeout(timer);
    };

    verifyAuth();
  }, [location.pathname]);

  // Loading State: Display a KALI-themed full-screen spinner
  if (isChecking) {
    return (
      <div className="pr-loader-container">
        <div className="pr-spinner"></div>
        <p className="pr-loading-text">Verifying Session...</p>
      </div>
    );
  }

  // Unauthenticated State: Redirect to login ("/")
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Authenticated State: Render children or fallback to Outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
