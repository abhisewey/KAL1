import React, { useState, useEffect, useRef } from 'react';
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
  Globe,
  AlertTriangle,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getVenueById } from '../api/venueApi';
import mockVenues from '../data/venues';
import './VenueDetails.css';

// ── Default fallback image from unsplash (a premium sports stadium background) ──
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540747737956-378724044282?auto=format&fit=crop&q=80&w=800';

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [venue, setVenue] = useState(null);
  const [error, setError] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Normalize details from both database and mock data sources
  const normalizeVenueDetail = (v) => {
    if (!v) return null;
    const rawId = v.osmId || String(v._id || v.id || Math.random());
    const idNum = parseInt(rawId.replace(/[^0-9]/g, '')) || 42;
    const reviewCount = v.reviewCount || (idNum % 200) + 12;
    const moreCount = v.moreCount || 0;

    return {
      id: v._id || v.id,
      slug: v.slug || v._id || v.id,
      name: v.name,
      image: v.image,
      rating: v.rating || 4.0,
      reviewCount,
      distance: v.distance || '2.0 km',
      fullAddress: v.address || v.fullAddress || `${v.locality ? v.locality + ', ' : ''}${v.city}`,
      featured: v.featured || false,
      description: v.description || 'No description available.',
      amenities: v.amenities || [],
      priceRange: v.priceRange || { min: 1000, max: 1800, per: 'hour' },
      sports: v.sports || [v.sport].filter(Boolean),
      openHours: v.openHours || v.openingHours || '06:00 AM - 10:00 PM',
      contact: v.contact || v.phone || '+91 98765 43210',
      website: v.website || '',
      latitude: v.latitude || 9.9816, // Default to Ernakulam center if absent
      longitude: v.longitude || 76.2999,
      mapsLink: v.mapsLink || `https://www.google.com/maps/dir/?api=1&destination=${v.latitude || 9.9816},${v.longitude || 76.2999}`,
    };
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      const isMongoId = id && id.match(/^[0-9a-fA-F]{24}$/);

      if (isMongoId) {
        try {
          const dbVenue = await getVenueById(id);
          if (dbVenue) {
            setVenue(normalizeVenueDetail(dbVenue));
          } else {
            // If API returns success but null, try to find in mock data
            const mock = mockVenues.find((v) => v.id === id || v.slug === id);
            if (mock) {
              setVenue(normalizeVenueDetail(mock));
            } else {
              setError("Venue not found in database or local mock assets.");
            }
          }
        } catch (err) {
          console.warn("[VenueDetails] Fetch failed, checking mock static data...", err.message);
          // Fallback to check mock data if backend call fails
          const mock = mockVenues.find((v) => v.id === id || v.slug === id);
          if (mock) {
            setVenue(normalizeVenueDetail(mock));
          } else {
            setError(err.message || "Failed to load venue details.");
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        // If not a Mongo ID, retrieve directly from static mock data
        const mock = mockVenues.find((v) => v.slug === id || v.id === id);
        if (mock) {
          setVenue(normalizeVenueDetail(mock));
        } else {
          setError("Venue not found.");
        }
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (venue && venue.latitude && venue.longitude && mapRef.current) {
      // Clean up previous map instance to prevent memory leaks / target re-initialization error
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      try {
        const coords = [venue.latitude, venue.longitude];
        
        mapInstance.current = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: false,
        }).setView(coords, 15);

        // Add OSM style map tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);

        // Custom green theme dot marker
        const customMarkerIcon = L.divIcon({
          html: `<div style="background-color: #16a34a; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 8px rgba(0,0,0,0.3)"></div>`,
          className: 'custom-leaflet-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        // Add marker to map
        L.marker(coords, { icon: customMarkerIcon }).addTo(mapInstance.current);
      } catch (err) {
        console.error("Leaflet map initialization failed:", err);
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [venue]);

  if (isLoading) {
    return (
      <div className="vd-loading-screen">
        <div className="vd-spinner"></div>
        <p>Loading venue details...</p>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="vd-not-found" role="alert">
        <AlertTriangle size={48} className="text-danger" style={{ marginBottom: '8px' }} />
        <h2>Error Loading Details</h2>
        <p>{error || "We couldn't locate the venue you're looking for."}</p>
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
    amenities,
    priceRange,
    sports,
    openHours,
    contact,
    website,
    mapsLink,
  } = venue;

  // Rating Badge Logic
  const ratingClass =
    rating >= 4.5 ? 'vd-rating--high' : rating >= 3.5 ? 'vd-rating--mid' : 'vd-rating--low';

  return (
    <main className="vd-page">
      {/* ── Hero image ───────────────────────────────── */}
      <div className="vd-hero">
        <img 
          src={image || FALLBACK_IMAGE} 
          alt={`${name} sports venue`} 
          className="vd-hero__img" 
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
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
{venue.images && venue.images.length > 0 && (
        <div className="vd-gallery">
          <h2 className="vd-section__title" id="vd-gallery-title">Gallery</h2>
          <div className="vd-gallery__scroll">
            {venue.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${name} image ${idx + 1}`}
                className="vd-gallery__img"
                onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
              />
            ))}
          </div>
        </div>
      )}
      {/* ── Content card ─────────────────────────────── */}
      <div className="vd-content">

        {/* ── Header row ──────────────────────────────── */}
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
              {Number(rating).toFixed(1)}
              {reviewCount > 0 && <span className="vd-rating__count">({reviewCount})</span>}
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
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" className="vd-pill vd-pill--link">
              <Globe size={16} aria-hidden="true" className="text-kali" />
              <span>Visit Website</span>
            </a>
          )}
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
            {sports.length > 0 && (
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
            )}

            {/* ── Location Map Section ───────────────────── */}
            <section className="vd-section" aria-labelledby="vd-map-title">
              <h2 className="vd-section__title" id="vd-map-title">
                <MapPin size={18} aria-hidden="true" className="text-kali" />
                Location Map
              </h2>
              <div 
                className="vd-map-container" 
                ref={mapRef} 
                style={{ 
                  height: '320px', 
                  borderRadius: '16px', 
                  border: '1px solid #E5E7EB', 
                  overflow: 'hidden', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  position: 'relative',
                  zIndex: 5
                }} 
              />
            </section>
          </div>

          {/* RIGHT COLUMN (Amenities) */}
          <aside className="vd-grid-sidebar">
            {amenities.length > 0 && (
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
            )}
          </aside>
        </div>

        {/* ── Book CTA ───────────────────────────────── */}
        <div className="vd-cta">
          <div className="vd-cta__price">
            <span className="vd-cta__price-label">Starting from</span>
            <span className="vd-cta__price-value">₹{priceRange.min}<span>/{priceRange.per}</span></span>
          </div>
          <div className="vd-cta__actions">
            <a 
              href={mapsLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary vd-cta__nav-btn"
              style={{ 
                marginRight: '12px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '14px 28px',
                textDecoration: 'none',
                background: '#ffffff',
                border: '1px solid #D1D5DB',
                borderRadius: '12px',
                fontWeight: '600',
                color: '#374151'
              }}
            >
              Get Directions
            </a>
            <button
              className="btn btn-primary vd-cta__btn"
              aria-label={`Book ${name}`}
              onClick={() => alert(`Booking flow for ${name} coming soon!`)}
            >
              Book Now
            </button>
          </div>
        </div>

      </div>
    </main>
  );
};

export default VenueDetails;
