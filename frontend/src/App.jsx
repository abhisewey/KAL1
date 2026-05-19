import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

/* ── Layout & Security ── */
import AppLayout from './Layout/AppLayout';
import ProtectedRoute from './Components/ProtectedRoute';

/* ── Public Pages ── */
import LoginModel from './Pages/LoginModel';

/* ── Protected Pages ── */
import Home from './Pages/Home';
import AllVenues from './Pages/AllVenues';
import VenueDetails from './Pages/VenueDetails';

/**
 * Public Route Guard (LoginRoute)
 * 
 * Prevents authenticated users from accessing the login page.
 * If a valid token is found, it redirects them to the home dashboard.
 */
const LoginRoute = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/home" replace />;
  }
  return <LoginModel />;
};

/**
 * Custom 404 Fallback Component
 */
const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#F8FAFC' }}>
    <h1 style={{ fontSize: '64px', color: '#10b981', margin: '0 0 16px' }}>404</h1>
    <h2 style={{ fontSize: '28px', color: '#0D0D0D', margin: '0 0 24px' }}>Page Not Found</h2>
    <p style={{ color: '#6B7280', marginBottom: '40px', fontSize: '16px' }}>
      The page you are looking for doesn't exist or has been moved.
    </p>
    <Link 
      to="/home" 
      style={{ 
        background: '#10b981', 
        color: 'white', 
        padding: '14px 32px', 
        borderRadius: '10px', 
        textDecoration: 'none',
        fontWeight: 'bold',
        transition: 'background 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
      onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
    >
      Return Home
    </Link>
  </div>
);

/**
 * App Component
 * 
 * Core routing matrix for the KALI application.
 * Governs the security boundary between public login and protected layouts.
 */
function App() {
  return (
    <Routes>
      
      {/* ── PUBLIC ROUTES ── */}
      {/* 
        The root path "/" loads the public Login page.
        If the user is already authenticated, LoginRoute redirects them to "/home".
      */}
      <Route path="/" element={<LoginRoute />} />
      <Route path="/login" element={<Navigate to="/" replace />} />

      {/* ── PROTECTED ROUTES ── */}
      {/* 
        Wraps internal pages with ProtectedRoute for auth state checks and
        AppLayout to render the persistent global Header/Footer elements.
      */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        {/* Dashboard Landing Page */}
        <Route path="/home" element={<Home />} />
        
        {/* Venue Listing Pages */}
        <Route path="/venues" element={<AllVenues />} />
        <Route path="/all-venues" element={<Navigate to="/venues" replace />} />

        {/* Venue Details (Supports both explicit ID and Slug path parameter structures) */}
        <Route path="/venue/:id" element={<VenueDetails />} />
        <Route path="/venues/:id" element={<VenueDetails />} />
      </Route>

      {/* ── FALLBACK 404 ROUTE ── */}
      <Route path="*" element={<NotFound />} />
      
    </Routes>
  );
}

export default App;
