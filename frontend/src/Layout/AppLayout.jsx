import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />   {/* This is the page that changes */}
      <Footer />
    </>
  );
};

export default AppLayout;
