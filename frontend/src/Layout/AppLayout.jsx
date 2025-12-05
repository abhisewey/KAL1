import React from "react";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
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
