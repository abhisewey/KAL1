import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import VenueCard from '../Components/Bookvenue/VenueCard';
import venues from '../data/venues';
import './AllVenues.css';

const ALL_SPORTS = ['All', ...Array.from(new Set(venues.flatMap((v) => v.sports || [])))];

const AllVenues = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeSport, setActiveSport] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  const filtered = useMemo(() => {
    let list = [...venues];

    // Filter by sport
    if (activeSport !== 'All') {
      list = list.filter((v) => (v.sports || []).includes(activeSport));
    }

    // Filter by search query (name or address)
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.fullAddress.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'distance') list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    if (sortBy === 'reviews') list.sort((a, b) => b.reviewCount - a.reviewCount);
    if (sortBy === 'price') list.sort((a, b) => a.priceRange.min - b.priceRange.min);

    return list;
  }, [query, activeSport, sortBy]);

  const handleCardClick = (venue) => {
    navigate(`/venues/${venue.slug}`);
  };

  const clearSearch = () => setQuery('');

  return (
    <main className="all-venues-page">
      {/* ── Page hero ─────────────────────────────────── */}
      <div className="all-venues-hero">
        <div className="all-venues-hero__inner">
          <h1 className="all-venues-hero__title">All Venues</h1>
          <p className="all-venues-hero__sub">
            {filtered.length} venue{filtered.length !== 1 ? 's' : ''} near you
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
          {ALL_SPORTS.map((sport) => (
            <button
              key={sport}
              className={`filter-chip ${activeSport === sport ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveSport(sport)}
              aria-pressed={activeSport === sport}
            >
              {sport}
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
            <option value="reviews">Most Reviewed</option>
            <option value="price">Lowest Price</option>
          </select>
        </div>
      </div>

      {/* ── Venue grid ────────────────────────────────── */}
      <div className="all-venues-container">
        {filtered.length > 0 ? (
          <div className="venues-grid" role="list" aria-label="Venue results">
            {filtered.map((venue) => (
              <div key={venue.id} role="listitem">
                <VenueCard venue={venue} onClick={handleCardClick} />
              </div>
            ))}
          </div>
        ) : (
          <div className="venues-empty" role="status" aria-live="polite">
            <p className="venues-empty__text">No venues match your search.</p>
            <button
              className="venues-empty__reset"
              onClick={() => { setQuery(''); setActiveSport('All'); }}
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
