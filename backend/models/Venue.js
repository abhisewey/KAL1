import mongoose from "mongoose";

// ═══════════════════════════════════════════════════════════
//  Venue.js — Mongoose model for sports / recreational venues
//
//  Data origin  : OpenStreetMap (via Overpass API)
//  Primary key  : osmId  (OSM element id as a string)
//  Unique pair  : osmId + category  (same POI can appear in
//                 multiple sport categories without duplication)
// ═══════════════════════════════════════════════════════════

const venueSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────
    /** OSM element id, e.g. "node/12345678" */
    osmId: {
      type: String,
      required: true,
      trim: true,
    },

    /** Display name of the venue */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    /** Primary sport tag from OSM, e.g. "cricket", "football" */
    sport: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    /**
     * Broad category bucket used for UI filtering.
     * Examples: "cricket", "football", "badminton", "swimming"
     */
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // ── Geo-coordinates ───────────────────────────────────
    /** WGS-84 decimal latitude */
    latitude: {
      type: Number,
      required: true,
    },

    /** WGS-84 decimal longitude */
    longitude: {
      type: Number,
      required: true,
    },

    // ── Location metadata ─────────────────────────────────
    /** Street-level address string */
    address: {
      type: String,
      default: "",
      trim: true,
    },

    /** Sub-district / locality within the city */
    locality: {
      type: String,
      default: "",
      trim: true,
    },

    /** Always "Kochi" for this dataset */
    city: {
      type: String,
      default: "Kochi",
      trim: true,
    },

    /** Always "Kerala" for this dataset */
    state: {
      type: String,
      default: "Kerala",
      trim: true,
    },

    // ── Media & content ───────────────────────────────────
    /** Primary cover image URL (remote or /uploads relative path) */
    image: {
      type: String,
      default: "",
    },

    /** Short marketing description shown on venue cards */
    description: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * List of available amenities.
     * e.g. ["Parking", "Floodlights", "Changing Rooms"]
     */
    amenities: {
      type: [String],
      default: [],
    },

    // ── Ratings & proximity ───────────────────────────────
    /** Aggregate star rating, 1–5. Defaults to 4.0. */
    rating: {
      type: Number,
      default: 4.0,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    /** Total number of reviews received */
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Human-readable distance string from a reference point.
     * e.g. "2.3 km"  — computed at fetch time, stored as-is.
     */
    distance: {
      type: String,
      default: "",
    },

    // ── Operational info ──────────────────────────────────
    /**
     * Opening hours in OSM format or plain English.
     * e.g. "Mo-Su 06:00-22:00"
     */
    openingHours: {
      type: String,
      default: "",
      trim: true,
    },

    /** Contact phone number */
    phone: {
      type: String,
      default: "",
      trim: true,
    },

    /** Official website URL */
    website: {
      type: String,
      default: "",
      trim: true,
    },

    // ── Discovery flags ───────────────────────────────────
    /** Whether the venue is promoted as a featured listing */
    featured: {
      type: Boolean,
      default: false,
    },

    /**
     * Venue classification for display purposes.
     * e.g. "Turf", "Academy", "Club", "Stadium", "Public Ground"
     */
    venueType: {
      type: String,
      default: "",
      trim: true,
    },

    /** Google Maps / OSM deep-link for directions */
    mapsLink: {
      type: String,
      default: "",
      trim: true,
    },

    // ── Audit ─────────────────────────────────────────────
    /** ISO timestamp of when this record was fetched from OSM */
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    /**
     * Automatically adds:
     *   createdAt — first insert timestamp
     *   updatedAt — last modification timestamp
     */
    timestamps: true,

    // Return plain JS objects by default (no extra mongoose metadata)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ═══════════════════════════════════════════════════════════
//  Indexes
// ═══════════════════════════════════════════════════════════

/**
 * UNIQUE compound index — prevents duplicate entries for the
 * same OSM element within the same sport category.
 */
venueSchema.index({ osmId: 1, category: 1 }, { unique: true });

/** Fast city-level queries (all venues are in Kochi, kept for future multi-city support) */
venueSchema.index({ city: 1 });

/** Filter/sort by sport category on the browse/search page */
venueSchema.index({ category: 1 });

/** Featured venues panel on the home page */
venueSchema.index({ featured: 1 });

/** Rating-based sorting (top-rated listings) */
venueSchema.index({ rating: -1 });

/** Geo bounding-box or proximity queries (lat/lng pair) */
venueSchema.index({ latitude: 1, longitude: 1 });

/** Composite for the most common API query: city + category + rating sort */
venueSchema.index({ city: 1, category: 1, rating: -1 });

// ═══════════════════════════════════════════════════════════
//  Model export
// ═══════════════════════════════════════════════════════════
const Venue = mongoose.model("Venue", venueSchema);

export default Venue;
