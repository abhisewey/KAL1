import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trophy } from 'lucide-react';
// import BookVenues from '../Components/Bookvenue/Bookvenues'; // Removed per requirement
import DiscoverGames from '../Components/Discovergames/Discovergames';
import FeaturedVenues from '../Components/FeaturedVenues/FeaturedVenues';
import './Home.css';

function Home() {
  const navigate = useNavigate();

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
      <section className="home-section featured-section">
        <FeaturedVenues />
      </section>

    </div>
  );
}

export default Home;
