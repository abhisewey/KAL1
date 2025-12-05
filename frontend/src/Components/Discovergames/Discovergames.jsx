import React, { useRef } from 'react';
import { Star, MapPin, Calendar, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import './DiscoverGames.css';

const DiscoverGames = () => {
  const scrollRef = useRef(null);

  const games = [
    {
      id: 1,
      sport: "Basketball",
      featured: true,
      host: {
        name: "Alex Kumar",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        karma: 245
      },
      date: "Dec 8, 2025",
      time: "6:00 PM - 8:00 PM",
      venue: "Green Park Arena",
      distance: "2.5 km",
      skillLevels: ["Intermediate", "Advanced"],
      spotsLeft: 3,
      totalSpots: 10
    },
    {
      id: 2,
      sport: "Football",
      featured: false,
      host: {
        name: "Priya Singh",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        karma: 532
      },
      date: "Dec 9, 2025",
      time: "5:30 PM - 7:30 PM",
      venue: "SportZone Complex",
      distance: "3.2 km",
      skillLevels: ["Beginner", "Intermediate"],
      spotsLeft: 5,
      totalSpots: 12
    },
    {
      id: 3,
      sport: "Tennis",
      featured: false,
      host: {
        name: "Rahul Mehta",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
        karma: 389
      },
      date: "Dec 10, 2025",
      time: "7:00 AM - 9:00 AM",
      venue: "Elite Sports Center",
      distance: "1.8 km",
      skillLevels: ["Advanced"],
      spotsLeft: 2,
      totalSpots: 4
    },
    {
      id: 4,
      sport: "Badminton",
      featured: false,
      host: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        karma: 612
      },
      date: "Dec 11, 2025",
      time: "6:30 PM - 8:30 PM",
      venue: "Urban Play Ground",
      distance: "4.1 km",
      skillLevels: ["Intermediate"],
      spotsLeft: 4,
      totalSpots: 8
    }
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 370;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="discover-games">
      <div className="discover-games-container">
        <div className="discover-games-header">
          <h2 className="section-title">Discover Games</h2>
          <a href="#" className="see-all-link">
            SEE ALL GAMES <span className="arrow">→</span>
          </a>
        </div>

        <div className="games-carousel" ref={scrollRef}>
          {games.map((game) => (
            <div key={game.id} className="game-card">
              {game.featured && (
                <div className="game-featured-badge">
                  <Star size={14} fill="#FCD34D" color="#FCD34D" />
                  <span>Featured</span>
                </div>
              )}
              
              <div className="game-sport-badge">{game.sport}</div>
              
              <div className="game-host">
                <img src={game.host.avatar} alt={game.host.name} className="host-avatar" />
                <div className="host-info">
                  <div className="host-name">{game.host.name}</div>
                  <div className="host-karma">{game.host.karma} karma</div>
                </div>
              </div>

              <div className="game-info">
                <div className="game-info-row">
                  <Calendar size={16} className="info-icon" />
                  <span>{game.date}</span>
                </div>
                <div className="game-info-row">
                  <Clock size={16} className="info-icon" />
                  <span>{game.time}</span>
                </div>
                <div className="game-info-row">
                  <MapPin size={16} className="info-icon" />
                  <span>{game.venue}</span>
                </div>
                <div className="game-info-row">
                  <MapPin size={16} className="info-icon" />
                  <span>{game.distance}</span>
                </div>
              </div>

              <div className="game-skills">
                {game.skillLevels.map((level, idx) => (
                  <span key={idx} className="skill-tag">{level}</span>
                ))}
              </div>

              <div className="game-spots">
                <Users size={16} />
                <span className="spots-text">{game.spotsLeft} spots left</span>
              </div>
            </div>
          ))}
        </div>

        <div className="carousel-controls">
          <button 
            className="carousel-arrow carousel-arrow-left" 
            onClick={() => scroll('left')}
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            className="carousel-arrow carousel-arrow-right" 
            onClick={() => scroll('right')}
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default DiscoverGames;