import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import "./AppLayout.css";

/**
 * AppLayout Component
 * 
 * Serves as the master presentation shell for all authenticated/internal pages.
 * Handles sticky/fixed UI rendering, flex-grow height calculations, and
 * consistent structural padding around the main router <Outlet />.
 */
const AppLayout = () => {
  return (
    <div className="app-layout-wrapper">
      {/* Navbar Container */}
      <header className="app-layout-header">
        <Navbar />
      </header>
      
      {/* Main Page Content - Grows to fill minimum screen height */}
      <main className="app-main-content">
        <div className="app-content-inner">
          <Outlet />
        </div>
      </main>
      
      {/* Footer Container */}
      <footer className="app-layout-footer">
        <Footer />
      </footer>
    </div>
  );
};

export default AppLayout;
