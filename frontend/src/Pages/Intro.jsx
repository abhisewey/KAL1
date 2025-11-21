import React from "react";
import "./Intro.css";
import stock1 from "../assets/Intro/kylian.jpg";
import stock2 from "../assets/Intro/ronado.webp";
import stock3 from "../assets/Intro/vinijr.webp";


export default function Intro() {
  return (
    <div className="container">

      {/* Header */}
      <header className="header">
        <div className="logo">KALI</div>

        <nav className="nav">
          <a className="nav-link" href="#"><span className="icon">🏃</span> Play</a>
          <a className="nav-link" href="#"><span className="icon">🏐</span> Book</a>
          
        </nav>

        <button className="auth-btn"><span className="icon">👤</span> Login / Signup</button>
      </header>


      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* LEFT SIDE */}
        <div className="content-left">

          <div className="location-box">
            <span className="location-icon">📍</span>
            <span>Kerala</span>
          </div>

          <h1 className="headline">
            BOOK SPORTS VENUES.<br />
            JOIN GAMES.<br />
            PLAY YOUR HEART OUT.
          </h1>

          <p className="subheadline">
            Kerala's Largest Football Community to Book<br />
            Venues, and Join Games Near You.
          </p>
        </div>


        {/* RIGHT SIDE */}
        <div className="content-right">

          <div className="platform-text">PLATFORM</div>

          <div className="images-grid">
            <div className="image-card basketball">
              <img src={stock1} alt="Basketball" />
            </div>

            <div className="image-card badminton">
              <img src={stock2}  alt="Badminton" />
            </div>

            <div className="image-card football">
              <img src={stock3}  alt="Football" />
            </div>
          </div>


          {/* FLOATING LOGO */}
          <div className="floating-logo">
            <div className="logo-circle">
              <span className="logo-icon">☎️</span>
            </div>
          </div>


        </div>
      </main>
    </div>
  );
}
