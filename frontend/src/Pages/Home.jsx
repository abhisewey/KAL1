import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trophy } from 'lucide-react';
import BookVenues from '../Components/Bookvenue/Bookvenues';
import DiscoverGames from '../Components/Discovergames/Discovergames';
import VenueCard from '../Components/Bookvenue/VenueCard'; 
import VenueSkeleton from '../Components/LoadingSkeleton/VenueSkeleton';
import venues from '../data/venues';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate network request for premium loading state demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Grab the top 4 featured venues for the highlight section
  const featuredVenues = venues.filter(v => v.featured).slice(0, 4);

  return (
    <div className="home-dashboard">
      
      {/* ── Hero Section ── */}
      <section className="home-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Trophy size={14} />
            <span>Welcome to KALI</span>
          </div>
          <h1 className="hero-title">
            Book Your Game,<br/>
            <span className="text-kali">Own the Field</span>
          </h1>
          <p className="hero-subtitle">
            Discover premium sports venues near you. From football turf to indoor badminton courts, instantly book and play.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary hero-btn" onClick={() => navigate('/venues')}>
              Explore Venues <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-visual-card">
             <img 
               src="https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&q=80&w=1000" 
               alt="Playing football" 
             />
          </div>
        </div>
      </section>

      {/* ── Categories / Discover Games ── */}
      <section className="home-section discover-section">
        <div className="section-header text-center">
          <h2>Discover Games</h2>
          <p>Find venues tailored to your favorite sports</p>
        </div>
        <DiscoverGames />
      </section>

      {/* ── Featured Venues Highlights ── */}
      {featuredVenues.length > 0 && (
        <section className="home-section featured-section">
          <div className="section-header">
            <div>
              <h2>Featured Venues</h2>
              <p>Top-rated locations hand-picked for you</p>
            </div>
            <button className="btn-link" onClick={() => navigate('/venues')}>
              View all <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="featured-scroll-container">
            <div className="featured-scroll-track">
              {isLoading 
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div className="featured-card-wrapper" key={`skeleton-${i}`}>
                      <VenueSkeleton />
                    </div>
                  ))
                : featuredVenues.map(venue => (
                    <div className="featured-card-wrapper" key={venue.id}>
                      <VenueCard venue={venue} onClick={() => navigate(`/venue/${venue.slug}`)} />
                    </div>
                  ))
              }
            </div>
          </div>
        </section>
      )}

      {/* ── Full Book Venues Section (Reused Component) ── */}
      <div className="home-book-venues-wrapper">
        <BookVenues variant="section" />
      </div>

    </div>
  );
}

export default Home;
