import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginModel.css';
import { loginUser, signupUser } from "../api/auth";

const LoginModel = ({ onClose }) => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);

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
      setSignupData({ ...signupData, profilePicture: e.target.files[0] });
    } else {
      setSignupData({ ...signupData, [e.target.name]: e.target.value });
    }
  };

  // ------------------ LOGIN API CALL -------------------

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(loginData);

      // Save JWT Token
      localStorage.setItem("token", res.data.token);

      // Navigate to home and close modal
      navigate('/home');
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  // ------------------ SIGNUP API CALL -------------------

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

      // Save JWT Token
      localStorage.setItem("token", res.data.token);

      // Navigate to home and close modal
      navigate('/home');
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Signup Failed");
    }
  };

  // ------------------ CARD FLIP -------------------

  const flipToSignup = () => setIsFlipped(true);
  const flipToLogin = () => setIsFlipped(false);

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          
          {/* Close Button */}
          <button className="close-button" onClick={onClose}>×</button>

          <div className={`flip-card ${isFlipped ? "flipped" : ""}`}>
            
            {/* ---------------- LOGIN SIDE ---------------- */}
            <div className="flip-card-front">
              <div className="modal-content">
                
                <h2 className="modal-title">Welcome Back</h2>
                <p className="modal-subtitle">Login to your account</p>

                <form className="form-container" onSubmit={handleLogin}>
                  
                  <div className="input-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <button type="submit" className="submit-button">
                    Login
                  </button>
                </form>

                <p className="switch-text">
                  Don't have an account?{" "}
                  <span className="switch-link" onClick={flipToSignup}>
                    Sign Up
                  </span>
                </p>
              </div>
            </div>

            {/* ---------------- SIGNUP SIDE ---------------- */}
            <div className="flip-card-back">
              <div className="modal-content">
                
                <h2 className="modal-title">Create Account</h2>
                <p className="modal-subtitle">Join us today</p>

                <form className="form-container" onSubmit={handleSignup}>
                  
                  <div className="input-group">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={signupData.username}
                      onChange={handleSignupChange}
                      placeholder="Choose a username"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      placeholder="Create a password"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Profile Picture</label>
                    <input
                      type="file"
                      name="profilePicture"
                      onChange={handleSignupChange}
                      accept="image/*"
                      className="file-input"
                    />
                  </div>

                  <button type="submit" className="submit-button">
                    Create Account
                  </button>
                </form>

                <p className="switch-text">
                  Already have an account?{" "}
                  <span className="switch-link" onClick={flipToLogin}>
                    Login
                  </span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModel;