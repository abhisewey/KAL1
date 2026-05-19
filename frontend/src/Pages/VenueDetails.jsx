import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Clock,
  Phone,
  ArrowLeft,
  IndianRupee,
  CheckCircle2,
  Dumbbell,
} from 'lucide-react';
import venues from "../data/venues";
import './VenueDetails.css';

const VenueDetails = () => {
  // Support both :id and :slug routing parameters gracefully
  const { id, slug } = useParams();
  const identifier = slug || id;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [venue, setVenue] = useState(null);

  useEffect(() => {
    // Simulate network fetch for premium UX feel
    const timer = setTimeout(() => {
      const foundVenue = venues.find((v) => v.slug === identifier || v.id === identifier);
      setVenue(foundVenue);
      setIsLoading(false);
    }, 400); // 400ms synthetic loading

    return () => clearTimeout(timer);
  }, [identifier]);

  if (isLoading) {
    return (
      <div className="vd-loading-screen">
        <div className="vd-spinner"></div>
        <p>Loading venue details...</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="vd-not-found" role="alert">
        <h2>Venue not found</h2>
        <p>We couldn't locate the venue you're looking for.</p>
        <button className="vd-back-btn" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>
    );
  }

  const {
    name,
    image,
    rating,
    reviewCount,
    distance,
    fullAddress,
    featured,
    description,
    amenities = [],
    priceRange,
    sports = [],
    openHours,
    contact,
  } = venue;

  // Rating Badge Logic
  const ratingClass =
    rating >= 4.5 ? 'vd-rating--high' : rating >= 3.5 ? 'vd-rating--mid' : 'vd-rating--low';

  return (
    <main className="vd-page">
      {/* ── Hero image ───────────────────────────────── */}
      <div className="vd-hero">
        <img src={image} alt={`${name} sports venue`} className="vd-hero__img" />
        <div className="vd-hero__overlay" aria-hidden="true" />

        {/* Elegant Back Button */}
        <button
          className="vd-hero__back hover-lift"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Badges */}
        <div className="vd-hero__badges">
          {featured && (
            <span className="vd-badge vd-badge--featured">
              <Star size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" />
              FEATURED
            </span>
          )}
        </div>
      </div>

      {/* ── Content card ─────────────────────────────── */}
      <div className="vd-content">

        {/* ── Header row ─────────────────────────────── */}
        <div className="vd-header">
          <div className="vd-header__left">
            <h1 className="vd-name">{name}</h1>
            <p className="vd-address">
              <MapPin size={15} aria-hidden="true" className="text-kali" />
              {fullAddress}
            </p>
          </div>
          <div className="vd-header__right">
            <span
              className={`vd-rating ${ratingClass}`}
              aria-label={`Rated ${rating} from ${reviewCount} reviews`}
            >
              <Star size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" />
              {rating.toFixed(1)}
              <span className="vd-rating__count">({reviewCount})</span>
            </span>
            <span className="vd-distance">
              <MapPin size={13} aria-hidden="true" className="text-kali" />~{distance}
            </span>
          </div>
        </div>

        {/* ── Quick info pills ───────────────────────── */}
        <div className="vd-pills" aria-label="Quick information">
          <div className="vd-pill">
            <Clock size={16} aria-hidden="true" className="text-kali" />
            <span>{openHours}</span>
          </div>
          <div className="vd-pill">
            <Phone size={16} aria-hidden="true" className="text-kali" />
            <span>{contact}</span>
          </div>
          <div className="vd-pill vd-pill--price">
            <IndianRupee size={16} aria-hidden="true" className="text-kali" />
            <span>
              ₹{priceRange.min}–{priceRange.max} / {priceRange.per}
            </span>
          </div>
        </div>

        <div className="vd-grid-layout">
          {/* LEFT COLUMN */}
          <div className="vd-grid-main">
            {/* ── Description ────────────────────────────── */}
            <section className="vd-section" aria-labelledby="vd-about-title">
              <h2 className="vd-section__title" id="vd-about-title">About this Venue</h2>
              <p className="vd-description">{description}</p>
            </section>

            {/* ── Sports offered ─────────────────────────── */}
            <section className="vd-section" aria-labelledby="vd-sports-title">
              <h2 className="vd-section__title" id="vd-sports-title">
                <Dumbbell size={18} aria-hidden="true" className="text-kali" />
                Sports Available
              </h2>
              <div className="vd-tags" role="list">
                {sports.map((s) => (
                  <span key={s} className="vd-tag" role="listitem">{s}</span>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN (Amenities) */}
          <aside className="vd-grid-sidebar">
            <section className="vd-section vd-amenities-box" aria-labelledby="vd-amenities-title">
              <h2 className="vd-section__title" id="vd-amenities-title">Amenities</h2>
              <ul className="vd-amenities" role="list">
                {amenities.map((item) => (
                  <li key={item} className="vd-amenity" role="listitem">
                    <CheckCircle2 size={16} className="vd-amenity__icon text-kali" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>

        {/* ── Book CTA ───────────────────────────────── */}
        <div className="vd-cta">
          <div className="vd-cta__price">
            <span className="vd-cta__price-label">Starting from</span>
            <span className="vd-cta__price-value">₹{priceRange.min}<span>/{priceRange.per}</span></span>
          </div>
          <button
            className="btn btn-primary vd-cta__btn"
            aria-label={`Book ${name}`}
            onClick={() => alert(`Booking flow for ${name} coming soon!`)}
          >
            Book Now
          </button>
        </div>

      </div>
    </main>
  );
};

export default VenueDetails;
