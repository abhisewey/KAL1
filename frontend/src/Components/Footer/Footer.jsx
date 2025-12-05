import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-wrapper">
              <div className="brand-logo">S</div>
              <div className="brand-name">SportHub</div>
            </div>
            <p className="brand-tagline">
              Connect with players, book venues, and discover games in your area.
            </p>
            <p className="footer-copyright">
              © 2025 SportHub. All rights reserved.
            </p>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Company</h3>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#press">Press</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Social</h3>
            <ul className="footer-links">
              <li><a href="#facebook">Facebook</a></li>
              <li><a href="#twitter">Twitter</a></li>
              <li><a href="#instagram">Instagram</a></li>
              <li><a href="#linkedin">LinkedIn</a></li>
              <li><a href="#youtube">YouTube</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Legal</h3>
            <ul className="footer-links">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
              <li><a href="#disclaimer">Disclaimer</a></li>
              <li><a href="#gdpr">GDPR</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Made with ❤️ for sports enthusiasts worldwide</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;