import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getFeaturedVenues } from '../../api/venueApi';
import VenueCard from '../Bookvenue/VenueCard';
import VenueSkeleton from '../LoadingSkeleton/VenueSkeleton';
import './FeaturedVenues.css';

/**
 * Horizontal scrolling list of featured venue cards.
 * - Fetches data using the backend `getFeaturedVenues` endpoint.
 * - Shows a loading skeleton while waiting.
 * - Limits the rendered list to 8 cards (adjustable via MAX_CARDS).
 * - Provides smooth scrolling with left/right arrow controls.
 * - Fully responsive – cards wrap on narrow viewports via CSS flex settings.
 */
const FeaturedVenues = () => {
  const MAX_CARDS = 8;
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef(null);

  // Fetch featured venues on mount
  useEffect(() => {
    const loadVenues = async () => {
      try {
        const data = await getFeaturedVenues();
        setVenues((data || []).slice(0, MAX_CARDS));
      } catch (err) {
        console.error('Failed to load featured venues:', err);
        setVenues([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadVenues();
  }, []);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="fv-section">
      {/* ── Heading ── */}
      <div className="fv-header">
        <div className="fv-header__text">
          <h2 className="fv-title">Featured Venues</h2>
          <p className="fv-subtitle">Top-rated sports venues handpicked for you</p>
        </div>
        <div className="fv-header__arrows">
          <button className="fv-arrow" onClick={() => scroll('left')} aria-label="Scroll left">
            <ArrowLeft size={18} />
          </button>
          <button className="fv-arrow" onClick={() => scroll('right')} aria-label="Scroll right">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* ── Carousel ── */}
      <div className="fv-carousel" ref={scrollRef}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div className="fv-card-slot" key={`sk-${i}`}>
                <VenueSkeleton />
              </div>
            ))
          : venues.map((venue) => (
              <div className="fv-card-slot" key={venue._id || venue.id}>
                <VenueCard venue={venue} />
              </div>
            ))
        }
        {!isLoading && venues.length === 0 && (
          <p className="fv-empty">No featured venues available right now.</p>
        )}
      </div>
    </div>
  );
};

export default FeaturedVenues;
