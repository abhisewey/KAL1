import React, { useState } from "react";
import "./Login.css";
// import loginImg from "../assets/login/loginIllustration.jpg"; 

export default function Login({ onClose }) {
  
  const [mode, setMode] = useState("main"); 
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <div className="login-overlay">
      <div className="login-modal">

        {/* LEFT IMAGE */}
        <div className="login-left">
          {/* <img src={loginImg} alt="login-illustration" /> */}
        </div>

        {/* RIGHT CONTENT */}
        <div className="login-right">

          <div className="login-header">
            <h2>Login / Sign Up</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          {/* ---------- MAIN OPTIONS ---------- */}
          {mode === "main" && (
            <div className="main-options">
              <button 
                className="social-btn whats-btn" 
                onClick={() => setMode("whatsapp")}
              >
                💬 Continue with WhatsApp
              </button>

              <button 
                className="social-btn email-btn" 
                onClick={() => setMode("email")}
              >
                📧 Continue with Email
              </button>
            </div>
          )}

          {/* ---------- WHATSAPP MODE ---------- */}
          {mode === "whatsapp" && (
            <div className="form-section">
              <label>Enter WhatsApp Number *</label>

              <div className="phone-input">
                <span className="country">+91 🇮🇳</span>
                <input 
                  type="text" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="WhatsApp number"
                />
              </div>

              <button className="otp-btn" onClick={() => setMode("whatsapp-otp")}>
                Send OTP
              </button>
            </div>
          )}

          {/* ---------- WHATSAPP OTP ---------- */}
          {mode === "whatsapp-otp" && (
            <div className="form-section">
              <label>Enter OTP sent to WhatsApp</label>

              <input 
                className="otp-input"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
              />

              <button className="otp-btn">Verify OTP</button>

              <div className="link" onClick={() => setMode("whatsapp")}>
                Change number
              </div>
            </div>
          )}

          {/* ---------- EMAIL MODE ---------- */}
          {mode === "email" && (
            <div className="form-section">
              <label>Enter Email *</label>

              <input 
                className="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
              />

              <button className="otp-btn" onClick={() => setMode("email-otp")}>
                Send OTP
              </button>
            </div>
          )}

          {/* ---------- EMAIL OTP ---------- */}
          {mode === "email-otp" && (
            <div className="form-section">
              <label>Enter OTP sent to Email</label>

              <input 
                className="otp-input"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
              />

              <button className="otp-btn">Verify OTP</button>

              <div className="link" onClick={() => setMode("email")}>
                Change email
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
