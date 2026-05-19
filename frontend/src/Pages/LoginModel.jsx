import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Upload, ArrowRight, ShieldCheck, Trophy, Calendar } from 'lucide-react';
import './LoginModel.css';
import { loginUser, signupUser } from "../api/auth";

/**
 * LoginModel - Sports-themed Split Landing Page & Auth Flip Card.
 * 
 * Serves as the landing hub when a user is not authenticated.
 * Left Side: Hero content highlighting statistics and app benefits.
 * Right Side: Glassmorphic auth card that flips between Login and Signup.
 */
const LoginModel = ({ onClose }) => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    profilePicture: null,
  });

  // ------------------ INPUT HANDLERS -------------------

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    if (e.target.name === "profilePicture") {
      const file = e.target.files[0];
      setSignupData({ ...signupData, profilePicture: file });
      if (file) {
        setProfilePreview(URL.createObjectURL(file));
      } else {
        setProfilePreview(null);
      }
    } else {
      setSignupData({ ...signupData, [e.target.name]: e.target.value });
    }
  };

  // ------------------ LOGIN API ------------------------

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(loginData);
      localStorage.setItem("token", res.data.token);
      
      // Navigate to Home layout
      navigate('/home');

      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  // ------------------ SIGNUP API ----------------------

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("username", signupData.username);
      formData.append("email", signupData.email);
      formData.append("password", signupData.password);

      if (signupData.profilePicture) {
        formData.append("profilePic", signupData.profilePicture);
      }

      const res = await signupUser(formData);
      localStorage.setItem("token", res.data.token);

      alert("Account Created Successfully!");
      navigate('/home');

      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Signup Failed");
    }
  };

  // Cleanup object URL previews on unmount
  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const flipToSignup = () => setIsFlipped(true);
  const flipToLogin = () => setIsFlipped(false);

  return (
    <div className="landing-page-container">
      
      {/* ──── HERO BRANDING PANEL (LEFT) ──── */}
      <div className="hero-branding-panel">
        <div className="hero-gradient-mesh"></div>
        <div className="hero-branding-header">
          <span className="hero-logo">KALI<span className="logo-dot">.</span></span>
        </div>
        
        <div className="hero-branding-content">
          <h1 className="hero-tagline">
            Your Premium <br />
            <span>Sports Arena</span> Hub
          </h1>
          <p className="hero-desc">
            Book premium turf fields, join sports communities, and organize games instantly. 
            Step up your weekend match in just a few taps.
          </p>
          
          {/* Quick Metrics */}
          <div className="hero-metrics-grid">
            <div className="metric-item">
              <Trophy className="metric-icon" size={24} />
              <div>
                <span className="metric-value">50+</span>
                <span className="metric-label">Exclusive Venues</span>
              </div>
            </div>
            <div className="metric-item">
              <Calendar className="metric-icon" size={24} />
              <div>
                <span className="metric-value">12k+</span>
                <span className="metric-label">Matches Booked</span>
              </div>
            </div>
            <div className="metric-item">
              <ShieldCheck className="metric-icon" size={24} />
              <div>
                <span className="metric-value">100%</span>
                <span className="metric-label">Instant Verification</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-branding-footer">
          <p>© {new Date().getFullYear()} KALI Platform. Elevating local athletics.</p>
        </div>
      </div>

      {/* ──── INTERACTIVE AUTH PANEL (RIGHT) ──── */}
      <div className="auth-panel-container">
        
        {/* Optional Close Button if modal actions exist */}
        {onClose && (
          <button className="auth-close-btn" onClick={onClose} aria-label="Close panel">
            <X size={24} />
          </button>
        )}

        <div className="auth-card-wrapper">
          <div className={`auth-flip-card ${isFlipped ? "is-flipped" : ""}`}>
            
            {/* ──── FRONT SIDE: LOGIN ──── */}
            <div className="auth-card-side auth-card-front">
              <div className="auth-form-card">
                <div className="form-header">
                  <h2>Welcome Back</h2>
                  <p>Log in to access your dashboard and booked matches.</p>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
                  <div className="auth-input-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label>Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-btn">
                    <span>Log In</span>
                    <ArrowRight size={18} />
                  </button>
                </form>

                <div className="form-switch-prompt">
                  <p>Don't have an account? <button type="button" onClick={flipToSignup} className="switch-anchor">Sign Up</button></p>
                </div>
              </div>
            </div>

            {/* ──── BACK SIDE: SIGNUP ──── */}
            <div className="auth-card-side auth-card-back">
              <div className="auth-form-card">
                <div className="form-header">
                  <h2>Join the Club</h2>
                  <p>Create an account to book your first arena.</p>
                </div>

                <form onSubmit={handleSignup} className="auth-form">
                  
                  {/* Avatar Upload with Live Preview */}
                  <div className="avatar-upload-section">
                    <div className="avatar-preview-box">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Preview" className="avatar-preview-img" />
                      ) : (
                        <User className="avatar-placeholder-icon" size={28} />
                      )}
                    </div>
                    <label className="avatar-upload-label">
                      <Upload size={14} />
                      <span>Upload Avatar</span>
                      <input
                        type="file"
                        name="profilePicture"
                        onChange={handleSignupChange}
                        accept="image/*"
                        className="hidden-file-input"
                      />
                    </label>
                  </div>

                  <div className="auth-input-group">
                    <label>Username</label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={18} />
                      <input
                        type="text"
                        name="username"
                        value={signupData.username}
                        onChange={handleSignupChange}
                        placeholder="e.g. Striker99"
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={signupData.email}
                        onChange={handleSignupChange}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label>Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input
                        type="password"
                        name="password"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        placeholder="Min 6 characters"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-btn">
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </button>
                </form>

                <div className="form-switch-prompt">
                  <p>Already have an account? <button type="button" onClick={flipToLogin} className="switch-anchor">Log In</button></p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default LoginModel;
