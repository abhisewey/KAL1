import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import VenueCard from './VenueCard';
import venues from '../../data/venues';
import './Bookvenues.css';

const BookVenues = ({ variant = 'default' }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 370;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleVenueClick = (venue) => {
    navigate(`/venue/${venue.slug}`);
  };

  const handleLogout = () => {
    // Navigate back to Intro / Login
    navigate('/');
  };

  return (
    <section className={`book-venues ${variant === 'section' ? 'book-venues--section' : ''}`} aria-labelledby="book-venues-title">
      <div className="book-venues-container">
        
        {/* KALI Header (Hide if embedded as a section in Home page) */}
        {variant !== 'section' && (
          <div className="kali-top-header">
            <h1 className="kali-logo">KALI</h1>
            <button className="logout-btn" onClick={handleLogout} aria-label="Logout">
              <span>Logout</span>
              <LogOut size={16} />
            </button>
          </div>
        )}

        {/* Section Header */}
        <div className={`book-venues-header ${variant === 'section' ? 'header--section' : ''}`}>
          <h2 className="section-title" id="book-venues-title">Book Venues</h2>
          <button
            className="see-all-link"
            onClick={() => navigate('/venues')}
            aria-label="See all available venues"
          >
            SEE ALL VENUES <span className="arrow" aria-hidden="true">→</span>
          </button>
        </div>

        {/* Carousel / Grid */}
        <div
          className="venues-carousel"
          ref={scrollRef}
          role="list"
          aria-label="Available venues"
        >
          {venues.map((venue) => (
            <div key={venue.id} className="venue-slide" role="listitem">
              <VenueCard
                venue={venue}
                onClick={handleVenueClick}
              />
            </div>
          ))}
        </div>

        {/* Scroll controls (Visible on mobile/tablet carousel) */}
        <div className="carousel-controls" role="group" aria-label="Carousel navigation">
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={() => scroll('left')}
            aria-label="Scroll venues left"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={() => scroll('right')}
            aria-label="Scroll venues right"
          >
            <ChevronRight size={24} />
          </button>
        </div>

      </div>
    </section>
  );
};

export default BookVenues;