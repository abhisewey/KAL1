import React, { useRef } from 'react';
import { Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import './BookVenues.css';

const BookVenues = () => {
  const scrollRef = useRef(null);

  const venues = [
    {
      id: 1,
      name: "Terra Arena",
      image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400&h=300&fit=crop",
      rating: 4.43,
      reviews: 7,
      distance: "3.17 Kms",
      address: "M.G. Railway Colony, O...",
      featured: true,
      moreCount: 4
    },
    {
      id: 2,
      name: "RSA Ravi's Turf",
      image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&h=300&fit=crop",
      rating: 2.17,
      reviews: 12,
      distance: "3.73 Kms",
      address: "15, Cambridge Road, Ne...",
      featured: true,
      moreCount: 0
    },
    {
      id: 3,
      name: "Game Theory - Joseph's...",
      image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=300&fit=crop",
      rating: 4.97,
      reviews: 262,
      distance: "0.13 Kms",
      address: "Gate 3, No.2, Vittal M...",
      featured: false,
      moreCount: 0
    },
    {
      id: 4,
      name: "Wellness Sports Inc -...",
      image: "https://images.unsplash.com/photo-1546608235-3310a2494cdf?w=400&h=300&fit=crop",
      rating: 4.20,
      reviews: 5,
      distance: "0.46 Kms",
      address: "#1, Bhavya Plaza, 2nd...",
      featured: false,
      moreCount: 0
    },
    {
      id: 5,
      name: "Green Park Arena",
      image: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=400&h=300&fit=crop",
      rating: 4.8,
      reviews: 156,
      distance: "2.5 Kms",
      address: "Park Street, Green Area",
      featured: false,
      moreCount: 0
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
    <section className="book-venues">
      <div className="book-venues-container">
        <div className="book-venues-header">
          <h2 className="section-title">Book Venues</h2>
          <a href="#" className="see-all-link">
            SEE ALL VENUES <span className="arrow">→</span>
          </a>
        </div>

        <div className="venues-carousel" ref={scrollRef}>
          {venues.map((venue) => (
            <div key={venue.id} className="venue-card">
              <div className="venue-image-wrapper">
                <img src={venue.image} alt={venue.name} className="venue-image" />
                {venue.featured && (
                  <div className="featured-badge">FEATURED</div>
                )}
                {venue.moreCount > 0 && (
                  <div className="more-badge">+{venue.moreCount} more</div>
                )}
              </div>
              <div className="venue-details">
                <h3 className="venue-name">{venue.name}</h3>
                <div className="venue-meta">
                  <div className="rating-badge">
                    {venue.rating} ({venue.reviews})
                  </div>
                </div>
                <div className="venue-location">
                  {venue.address} (~{venue.distance})
                </div>
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

export default BookVenues;