import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, RotateCcw, AlertCircle } from 'lucide-react';
import VenueCard from './VenueCard';
import VenueSkeleton from '../LoadingSkeleton/VenueSkeleton';
import { getVenuesByCategory } from '../../api/venueApi';
import './Bookvenues.css';

// ── Hardcoded categories with emojis for premium modern design ──────────
const CATEGORIES = [
  { id: 'football', label: 'Football', icon: '⚽' },
  { id: 'cricket', label: 'Cricket', icon: '🏏' },
  { id: 'badminton', label: 'Badminton', icon: '🏸' },
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
  { id: 'tennis', label: 'Tennis', icon: '🎾' },
  { id: 'swimming', label: 'Swimming', icon: '🏊' },
  { id: 'gym', label: 'Gym & Fitness', icon: '💪' },
  { id: 'volleyball', label: 'Volleyball', icon: '🏐' },
];

const BookVenues = ({ variant = 'default' }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  
  const [activeCategory, setActiveCategory] = useState('football');
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch and normalize data from the backend
  const fetchVenues = async (category) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVenuesByCategory(category);
      
      // Normalize backend schema to match VenueCard prop expectations
      const normalized = data.map((v) => {
        // Derive unique review count and photo moreCount deterministically
        const rawId = v.osmId || String(v._id || Math.random());
        const idNum = parseInt(rawId.replace(/[^0-9]/g, '')) || 42;
        const reviewCount = (idNum % 200) + 12;
        const moreCount = (idNum % 6) + 1;

        return {
          id: v._id || v.id,
          slug: v._id || v.id,
          name: v.name,
          image: v.image,
          rating: v.rating || 4.0,
          reviewCount,
          distance: v.distance || '2.0 km',
          fullAddress: v.address || `${v.locality ? v.locality + ', ' : ''}${v.city}`,
          featured: v.featured || false,
          moreCount,
          sports: [v.sport || category],
        };
      });

      setVenues(normalized);
    } catch (err) {
      setError(err.message || 'Failed to fetch venues from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues(activeCategory);
  }, [activeCategory]);

  const handleRetry = () => {
    fetchVenues(activeCategory);
  };

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
    navigate(`/venues/${venue.id}`);
  };

  const handleLogout = () => {
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

        {/* ── Category Selectors (Premium Pills) ────────────────────────── */}
        <div className="category-scroll-wrapper" role="group" aria-label="Select sports category">
          <div className="category-list">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`category-pill ${activeCategory === cat.id ? 'category-pill--active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={activeCategory === cat.id}
              >
                <span className="category-pill__icon" aria-hidden="true">{cat.icon}</span>
                <span className="category-pill__label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Display States ───────────────────────────────────────── */}
        
        {/* State 1: Loading State */}
        {loading && (
          <div className="venues-carousel venues-carousel--loading" role="marquee" aria-busy="true">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="venue-slide">
                <VenueSkeleton />
              </div>
            ))}
          </div>
        )}

        {/* State 2: Error State */}
        {!loading && error && (
          <div className="venues-error-card" role="alert">
            <AlertCircle className="venues-error-card__icon" size={40} />
            <h3 className="venues-error-card__title">Connection Error</h3>
            <p className="venues-error-card__msg">{error}</p>
            <button className="venues-error-card__retry" onClick={handleRetry}>
              <RotateCcw size={16} />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* State 3: Empty State */}
        {!loading && !error && venues.length === 0 && (
          <div className="venues-empty-card" role="status">
            <span className="venues-empty-card__emoji" aria-hidden="true">🗺️</span>
            <h3 className="venues-empty-card__title">No venues found</h3>
            <p className="venues-empty-card__msg">
              We couldn't find any {CATEGORIES.find(c => c.id === activeCategory)?.label} venues in Kochi area right now.
            </p>
          </div>
        )}

        {/* State 4: Data Loaded State */}
        {!loading && !error && venues.length > 0 && (
          <>
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

            {/* Scroll controls (Visible on mobile/tablet carousel, auto-hidden on grid layout) */}
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
          </>
        )}

      </div>
    </section>
  );
};

export default BookVenues;