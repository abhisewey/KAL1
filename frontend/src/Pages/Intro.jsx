import React, { useState } from "react";
import "./Intro.css";
import { useNavigate } from "react-router-dom";
import LoginModel from "./LoginModel";
import stock1 from "../assets/Intro/kylian.jpg";
import stock2 from "../assets/Intro/ronado.webp";
import stock3 from "../assets/Intro/vinijr.webp";

export default function Intro() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <div className="container">
        {/* HEADER */}
        <header className="header">
          <div className="logo">KALI</div>
          <nav className="nav">
            <a className="nav-link" onClick={() => setShowLogin(true)}>
              🏃 Play
            </a>
            <a className="nav-link" onClick={() => setShowLogin(true)}>
              🏐 Book
            </a>
          </nav>

          <button className="auth-btn" onClick={() => setShowLogin(true)}>
            👤 Login / Signup
          </button>
        </header>

        {/* MAIN CONTENT */}
        <main className="main-content">
          <div className="content-left">
            <div className="location-box">
              <span className="location-icon">📍</span> 
              <span>Kerala</span>
            </div>

            <h1 className="headline">
              BOOK SPORTS VENUES. <br />
              JOIN GAMES. <br />
              PLAY YOUR HEART OUT.
            </h1>

            <p className="subheadline">
              Kerala's Largest Football Community to Book <br />
              Venues, and Join Games Near You.
            </p>
          </div>

          <div className="content-right">
            <div className="platform-text">PLATFORM</div>

            <div className="images-grid">
              <div className="image-card basketball">
                <img src={stock1} alt="" />
              </div>

              <div className="image-card badminton">
                <img src={stock2} alt="" />
              </div>

              <div className="image-card football">
                <img src={stock3} alt="" />
              </div>
            </div>
          </div>
        </main>

        {/* LOGIN MODAL (FRAGMENT) */}
        {showLogin && <LoginModel onClose={() => setShowLogin(false)} />}
      </div>
    </>
  );
}
