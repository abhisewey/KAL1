import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, AlertCircle, RotateCcw } from 'lucide-react';
import VenueCard from '../Components/Bookvenue/VenueCard';
import VenueSkeleton from '../Components/LoadingSkeleton/VenueSkeleton';
import { getVenues } from '../api/venueApi';
import './AllVenues.css';

// Categories matching our Overpass backend
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'football', label: 'Football' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'badminton', label: 'Badminton' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'swimming', label: 'Swimming' },
  { id: 'gym', label: 'Gym & Fitness' },
  { id: 'volleyball', label: 'Volleyball' },
];

const AllVenues = () => {
  const navigate = useNavigate();
  
  // State
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeSport, setActiveSport] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  
  // Data State
  const [venues, setVenues] = useState([]);
  const [totalVenues, setTotalVenues] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Debounce the search query to prevent spamming the API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // 2. Fetch data from backend API whenever filters change
  const fetchVenues = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: 1,
        limit: 100, // Fetch up to 100 venues for this view
        sort: sortBy,
      };
      
      if (activeSport !== 'all') {
        params.category = activeSport;
      }
      
      if (debouncedQuery.trim()) {
        params.search = debouncedQuery.trim();
      }
      
      const response = await getVenues(params);
      
      // Normalize backend schema to match VenueCard prop expectations
      const normalized = (response.venues || []).map((v) => {
        const rawId = String(v.osmId || v._id || Math.random());
        const idNum = parseInt(rawId.replace(/[^0-9]/g, '')) || 42;
        const reviewCount = v.reviewCount || (idNum % 200) + 12;
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
          sports: [v.sport || v.category || activeSport],
        };
      });

      setVenues(normalized);
      setTotalVenues(response.total || normalized.length);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load venues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [activeSport, sortBy, debouncedQuery]);

  const handleCardClick = (venue) => {
    navigate(`/venues/${venue.slug}`);
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <main className="all-venues-page">
      {/* ── Page hero ─────────────────────────────────── */}
      <div className="all-venues-hero">
        <div className="all-venues-hero__inner">
          <h1 className="all-venues-hero__title">All Venues</h1>
          <p className="all-venues-hero__sub">
            {loading ? 'Finding venues...' : `${totalVenues} venue${totalVenues !== 1 ? 's' : ''} near you`}
          </p>

          {/* Search bar */}
          <div className="all-venues-search">
            <Search size={18} className="all-venues-search__icon" aria-hidden="true" />
            <input
              id="venue-search"
              type="search"
              className="all-venues-search__input"
              placeholder="Search by name or location…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search venues"
            />
            {query && (
              <button
                className="all-venues-search__clear"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filters bar ───────────────────────────────── */}
      <div className="all-venues-filters" role="toolbar" aria-label="Filter venues">
        {/* Sport chips */}
        <div className="filter-chips" role="group" aria-label="Filter by sport">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`filter-chip ${activeSport === cat.id ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveSport(cat.id)}
              aria-pressed={activeSport === cat.id}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort select */}
        <div className="filter-sort">
          <SlidersHorizontal size={15} aria-hidden="true" />
          <label htmlFor="sort-select" className="sr-only">Sort by</label>
          <select
            id="sort-select"
            className="filter-sort__select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort venues"
          >
            <option value="rating">Top Rated</option>
            <option value="distance">Nearest First</option>
            <option value="name">Alphabetical</option>
            <option value="featured">Featured First</option>
          </select>
        </div>
      </div>

      {/* ── Venue grid ────────────────────────────────── */}
      <div className="all-venues-container">
        
        {/* State 1: Loading */}
        {loading && (
          <div className="venues-grid" role="status" aria-busy="true">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i}>
                <VenueSkeleton />
              </div>
            ))}
          </div>
        )}

        {/* State 2: Error */}
        {!loading && error && (
          <div className="venues-empty" role="alert">
            <AlertCircle size={40} style={{ color: 'var(--kali-red)', marginBottom: '1rem' }} />
            <p className="venues-empty__text">{error}</p>
            <button
              className="venues-empty__reset"
              onClick={fetchVenues}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
            >
              <RotateCcw size={16} /> Try Again
            </button>
          </div>
        )}

        {/* State 3: Data Loaded */}
        {!loading && !error && venues.length > 0 && (
          <div className="venues-grid" role="list" aria-label="Venue results">
            {venues.map((venue) => (
              <div key={venue.id} role="listitem">
                <VenueCard venue={venue} onClick={handleCardClick} />
              </div>
            ))}
          </div>
        )}

        {/* State 4: Empty Results */}
        {!loading && !error && venues.length === 0 && (
          <div className="venues-empty" role="status" aria-live="polite">
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🗺️</span>
            <p className="venues-empty__text">No venues match your search.</p>
            <button
              className="venues-empty__reset"
              onClick={() => { setQuery(''); setActiveSport('all'); }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default AllVenues;
