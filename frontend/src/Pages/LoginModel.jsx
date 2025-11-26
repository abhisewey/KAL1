import React, { useState } from 'react';
import './LoginModel.css';

const LoginModel = ({ onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    profilePicture: null
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    if (e.target.name === 'profilePicture') {
      setSignupData({ ...signupData, profilePicture: e.target.files[0] });
    } else {
      setSignupData({ ...signupData, [e.target.name]: e.target.value });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login:', loginData);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    console.log('Signup:', signupData);
  };

  const flipToSignup = () => {
    setIsFlipped(true);
  };

  const flipToLogin = () => {
    setIsFlipped(false);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
          
          <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
            <div className="flip-card-front">
              <div className="modal-content">
                <h2 className="modal-title">Welcome Back</h2>
                <p className="modal-subtitle">Login to your account</p>
                
                <div className="form-container">
                  <div className="input-group">
                    <label htmlFor="login-email">Email</label>
                    <input
                      type="email"
                      id="login-email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="login-password">Password</label>
                    <input
                      type="password"
                      id="login-password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  
                  <button onClick={handleLogin} className="submit-button">
                    Login
                  </button>
                </div>
                
                <p className="switch-text">
                  Don't have an account?{' '}
                  <span className="switch-link" onClick={flipToSignup}>
                    Sign Up
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flip-card-back">
              <div className="modal-content">
                <h2 className="modal-title">Create Account</h2>
                <p className="modal-subtitle">Join us today</p>
                
                <div className="form-container">
                  <div className="input-group">
                    <label htmlFor="signup-username">Username</label>
                    <input
                      type="text"
                      id="signup-username"
                      name="username"
                      value={signupData.username}
                      onChange={handleSignupChange}
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="signup-email">Email</label>
                    <input
                      type="email"
                      id="signup-email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="signup-password">Password</label>
                    <input
                      type="password"
                      id="signup-password"
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="profile-picture">Profile Picture</label>
                    <input
                      type="file"
                      id="profile-picture"
                      name="profilePicture"
                      onChange={handleSignupChange}
                      accept="image/*"
                      className="file-input"
                    />
                  </div>
                  
                  <button onClick={handleSignup} className="submit-button">
                    Create Account
                  </button>
                </div>
                
                <p className="switch-text">
                  Already have an account?{' '}
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