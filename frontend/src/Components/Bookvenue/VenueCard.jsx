import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Images } from 'lucide-react';
import './VenueCard.css';

// Category-specific fallback images
const CATEGORY_FALLBACKS = {
  cricket: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800",
  football: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=800",
  badminton: "https://images.unsplash.com/photo-1626224583760-4bfc36b13e9a?auto=format&fit=crop&q=80&w=800",
  basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800",
  tennis: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800",
  swimming: "https://images.unsplash.com/photo-1519315901367-f34f927e1088?auto=format&fit=crop&q=80&w=800",
  gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
  volleyball: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=800",
  default: "https://images.unsplash.com/photo-1540747737956-378724044282?auto=format&fit=crop&q=80&w=800",
};

const getFallbackImage = (category) => {
  if (!category) return CATEGORY_FALLBACKS.default;
  const key = category.toLowerCase().trim();
  return CATEGORY_FALLBACKS[key] || CATEGORY_FALLBACKS.default;
};

/**
 * VenueCard – displays essential venue info.
 * Shows image, name, category/sport, rating, distance, and a featured badge.
 */
const VenueCard = ({ venue, onClick, className = '' }) => {
  const navigate = useNavigate();
  if (!venue) return null;

  // Support both legacy and new backend fields
  const {
    _id,
    id,
    name = 'Unnamed Venue',
    category,
    sport,
    image,
    rating = 0,
    reviewCount = 0,
    distance,
    address,
    locality,
    city,
    featured = false,
  } = venue;

  const venueId = _id || id;
  const primaryCategory = sport || category || 'Venue';
  const displayImage = image || getFallbackImage(primaryCategory);
  const location = address || `${locality ? locality + ', ' : ''}${city || ''}`;
  const distanceStr = typeof distance === 'number' ? `${(distance / 1000).toFixed(1)} km` : distance || 'N/A';

  const ratingClass = rating >= 4 ? 'venue-card__rating--high' : rating >= 3 ? 'venue-card__rating--mid' : 'venue-card__rating--low';

  const handleClick = () => {
    if (onClick) onClick(venue);
    else navigate(`/venue/${venueId}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleImageError = (e) => {
    e.target.src = getFallbackImage(primaryCategory);
  };

  return (
    <article
      className={`venue-card-v2 ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${name}`}
    >
      {/* Image Section */}
      <div className="venue-card__img-wrapper">
        <img
          src={displayImage}
          alt={`${name} sports venue`}
          className="venue-card__img"
          loading="lazy"
          draggable="false"
          onError={handleImageError}
        />
        <div className="venue-card__img-overlay" aria-hidden="true" />
        <span className="venue-card__sport-tag" aria-label={`Category: ${primaryCategory}`}>
          {primaryCategory.charAt(0).toUpperCase() + primaryCategory.slice(1)}
        </span>
        {featured && (
          <span className="venue-card__featured-badge" aria-label="Featured venue">
            <Star size={11} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            FEATURED
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="venue-card__body">
        <div className="venue-card__meta-row">
          <span className={`venue-card__rating ${ratingClass}`} aria-label={`Rating ${rating} from ${reviewCount} reviews`}>
            <Star size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            {Number(rating).toFixed(1)}
            {reviewCount > 0 && <span className="venue-card__review-count">({reviewCount})</span>}
          </span>
          <span className="venue-card__distance" aria-label={`Distance ${distanceStr}`}>
            ~{distanceStr}
          </span>
        </div>
        <h3 className="venue-card__name">{name}</h3>
        <p className="venue-card__address">
          <MapPin size={13} strokeWidth={2} className="venue-card__pin-icon" aria-hidden="true" />
          <span>{location}</span>
        </p>
      </div>
    </article>
  );
};

export default VenueCard;
