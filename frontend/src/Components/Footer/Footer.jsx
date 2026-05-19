import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, Send } from 'lucide-react';
import './Footer.css';

/**
 * Footer Component
 * 
 * Luxury dark-themed global footer with KALI green accents.
 * Presents a five-column layout on desktop: Brand Info, Explore, Company, Legal, and Newsletter.
 */
const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing, ${email}!`);
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Main Footer Content Grid */}
        <div className="footer-content">
          
          {/* Column 1: Brand & Socials */}
          <div className="footer-brand">
            <div className="brand-wrapper">
              <NavLink to="/home" className="brand-name-link">
                KALI<span className="brand-dot">.</span>
              </NavLink>
            </div>
            <p className="brand-tagline">
              Book your game, own the field. Elevate your sporting experience by booking premium venues in seconds.
            </p>
            <div className="social-links" aria-label="Social media links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className="footer-column">
            <h3 className="footer-title">Explore</h3>
            <ul className="footer-links">
              <li><NavLink to="/home">Home</NavLink></li>
              <li><NavLink to="/venues">Book Venues</NavLink></li>
              <li><NavLink to="/games">Discover Games</NavLink></li>
              <li><NavLink to="/community">Community</NavLink></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="footer-column">
            <h3 className="footer-title">Company</h3>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#partners">Partners</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="footer-column">
            <h3 className="footer-title">Legal</h3>
            <ul className="footer-links">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
              <li><a href="#contact">Contact Support</a></li>
            </ul>
          </div>

          {/* Column 5: Newsletter */}
          <div className="footer-column footer-newsletter">
            <h3 className="footer-title">Newsletter</h3>
            <p className="newsletter-text">
              Subscribe to get special offers, tournament updates, and new venue alerts.
            </p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <div className="input-group">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address for newsletter"
                />
                <button type="submit" aria-label="Subscribe">
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Divider Line */}
        <div className="footer-divider" aria-hidden="true" />

        {/* Bottom Copyright Bar */}
        <div className="footer-bottom">
          <p className="copyright-text">
            © {new Date().getFullYear()} KALI. All rights reserved.
          </p>
          <p className="credit-text">
            Engineered with ❤️ for athletes and sports communities.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;