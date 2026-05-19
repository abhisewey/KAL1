import React from 'react';
import { MapPin, Star, Images } from 'lucide-react';
import './VenueCard.css';

/**
 * VenueCard — reusable card component for a single venue.
 *
 * @param {Object}   venue              - Venue data object from venues.js
 * @param {Function} [onClick]          - Optional click handler (receives venue)
 * @param {string}   [className]        - Extra class names for the wrapper
 */
const VenueCard = ({ venue, onClick, className = '' }) => {
  if (!venue) return null;

  const {
    id,
    slug,
    name,
    image,
    rating,
    reviewCount,
    distance,
    fullAddress,
    featured,
    moreCount,
    sports = [],
  } = venue;

  const handleClick = () => {
    if (onClick) onClick(venue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Color-code rating: green ≥4, amber 3–4, red <3
  const ratingClass =
    rating >= 4
      ? 'venue-card__rating--high'
      : rating >= 3
      ? 'venue-card__rating--mid'
      : 'venue-card__rating--low';

  return (
    <article
      className={`venue-card-v2 ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${name}, rated ${rating} out of 5, located ${distance} away`}
      data-venue-id={id}
      data-venue-slug={slug}
    >
      {/* ── Image section ─────────────────────────────── */}
      <div className="venue-card__img-wrapper">
        <img
          src={image}
          alt={`${name} sports venue`}
          className="venue-card__img"
          loading="lazy"
          draggable="false"
        />

        {/* Gradient overlay for legibility of badges */}
        <div className="venue-card__img-overlay" aria-hidden="true" />

        {/* Top-left: sport tags (first sport only to keep it clean) */}
        {sports.length > 0 && (
          <span className="venue-card__sport-tag" aria-label={`Sport: ${sports[0]}`}>
            {sports[0]}
          </span>
        )}

        {/* Bottom-left: "+X more" photos badge */}
        {moreCount > 0 && (
          <span
            className="venue-card__more-badge"
            aria-label={`${moreCount} more photos`}
          >
            <Images size={13} strokeWidth={2.5} aria-hidden="true" />
            +{moreCount} more
          </span>
        )}

        {/* Bottom-right: FEATURED badge */}
        {featured && (
          <span className="venue-card__featured-badge" aria-label="Featured venue">
            <Star size={11} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            FEATURED
          </span>
        )}
      </div>

      {/* ── Content section ───────────────────────────── */}
      <div className="venue-card__body">
        {/* Rating pill + distance row */}
        <div className="venue-card__meta-row">
          <span
            className={`venue-card__rating ${ratingClass}`}
            aria-label={`Rating: ${rating} from ${reviewCount} reviews`}
          >
            <Star size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            {rating.toFixed(2)}&nbsp;
            <span className="venue-card__review-count">({reviewCount})</span>
          </span>

          <span className="venue-card__distance" aria-label={`Distance: approximately ${distance}`}>
            ~{distance}
          </span>
        </div>

        {/* Venue name */}
        <h3 className="venue-card__name">{name}</h3>

        {/* Address */}
        <p className="venue-card__address">
          <MapPin
            size={13}
            strokeWidth={2}
            className="venue-card__pin-icon"
            aria-hidden="true"
          />
          <span>{fullAddress}</span>
        </p>
      </div>
    </article>
  );
};

export default VenueCard;
