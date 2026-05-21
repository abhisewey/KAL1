import axios from "axios";

// ═══════════════════════════════════════════════════════════════════════════
//  venueApi.js — Frontend API client for the KALI Venue endpoints
//
//  Base URL is read from the Vite env variable VITE_API_URL.
//  Falls back to http://localhost:5000 for local development.
//
//  All public endpoints return the backend envelope:
//    { success: bool, source: string, total: number, venues?: [], venue?: {} }
// ═══════════════════════════════════════════════════════════════════════════

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: `${BASE_URL}/api/venues`,
  timeout: 20_000, // 20 s — Overpass can be slow on first cache miss
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request interceptor — attach JWT token if present ─────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.debug(
      `[venueApi] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      config.params || ""
    );
    return config;
  },
  (err) => Promise.reject(err)
);

// ── Response interceptor — normalised debug logging ───────────────────────
API.interceptors.response.use(
  (response) => {
    const { source, total } = response.data || {};
    console.debug(
      `[venueApi] ← ${response.status} | source: ${source ?? "?"} | total: ${total ?? "?"}`
    );
    return response;
  },
  (err) => Promise.reject(err)
);

// ── Normalised error handler ──────────────────────────────────────────────
/**
 * Converts an Axios error into a clean object and re-throws it.
 * Components can catch `err.message` for display, or `err.code` for branching.
 */
const handleApiError = (err) => {
  let message = "An unexpected error occurred. Please try again.";
  let status = 500;
  let code = "UNKNOWN_ERROR";

  if (err.response) {
    // Server responded — extract backend message if available
    message = err.response.data?.message || err.response.statusText || "Server Error";
    status = err.response.status;
    code = status === 404 ? "NOT_FOUND"
      : status === 400 ? "BAD_REQUEST"
        : status === 401 ? "UNAUTHORIZED"
          : status === 503 ? "SERVICE_UNAVAILABLE"
            : "SERVER_ERROR";
  } else if (err.request) {
    // Request sent but no response (network down / timeout)
    message = "Cannot reach the server. Please check your internet connection.";
    status = 0;
    code = err.code === "ECONNABORTED" ? "TIMEOUT" : "NETWORK_ERROR";
  } else {
    message = err.message;
    code = "REQUEST_SETUP_ERROR";
  }

  const normalised = { message, status, code };
  console.error("[venueApi] Error:", normalised);
  throw normalised;
};

// ═══════════════════════════════════════════════════════════════════════════
//  PUBLIC FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch venues by sport category.
 * Hits the cache-first backend pipeline (MongoDB → Overpass fallback).
 *
 * @param {string} category  - e.g. "football", "badminton"
 * @param {object} [options]
 * @param {boolean} [options.force=false]    - bypass server-side cache
 * @param {string}  [options.sort="rating"]  - "rating" | "name" | "distance"
 * @param {number}  [options.limit]          - max results to return
 * @returns {Promise<object[]>}
 */
export const getVenuesByCategory = async (category, options = {}) => {
  try {
    const { force = false, sort = "rating", limit } = options;
    const params = { sort };
    if (force) params.force = "true";
    if (limit) params.limit = limit;

    const { data } = await API.get(`/${category}`, { params });

    // Attach source tag to each venue for optional UI indicators
    const venues = (data?.venues || []).map((v) => ({
      ...v,
      _source: data.source, // "cache" | "overpass" | "cache-stale" | "cache-fallback"
    }));

    return venues;
  } catch (err) {
    return handleApiError(err);
  }
};

/**
 * Retrieve detailed data for a single venue.
 *
 * @param {string} id - MongoDB ObjectId (24 hex chars)
 * @returns {Promise<object|null>} The venue object or null if not found.
 * @throws Will re‑throw a normalized error object via `handleApiError`.
 */
export const getVenueById = async (id) => {
  try {
    if (!id) throw new Error("Venue ID is required.");
    const { data } = await API.get(`/${id}`);
    // Attach source metadata for UI debugging if needed.
    return data?.venue ? { ...data.venue, _source: data.source } : null;
  } catch (err) {
    return handleApiError(err);
  }
};

/**
 * Fetch all available sport categories (merged Overpass config + DB).
 *
 * @returns {Promise<string[]>}
 */
export const getCategories = async () => {
  try {
    const { data } = await API.get("/categories");
    return data?.categories || [];
  } catch (err) {
    return handleApiError(err);
  }
};

/**
 * Fetch all featured venues (auto-promotes top-rated if none explicitly set).
 *
 * @returns {Promise<object[]>}
 */
/**
 * Retrieve a curated list of featured venues.
 *
 * The backend returns a `{ venues, source }` envelope where `source` indicates
 * whether the data originated from the cache, Overpass, or a fallback. We attach
 * this information to each venue under the `_source` key to enable UI debugging
 * (e.g., showing a badge for stale data).
 *
 * @returns {Promise<object[]>} Array of venue objects (empty array on error).
 * @throws Will re‑throw a normalized error object via `handleApiError`.
 */
export const getFeaturedVenues = async () => {
  try {
    const { data } = await API.get("/featured");
    const venues = (data?.venues || []).map(v => ({
      ...v,
      _source: data.source,
    }));
    return venues;
  } catch (err) {
    return handleApiError(err);
  }
};

/**
 * Fetch paginated venue list with optional filters.
 *
 * @param {object} [params]
 * @param {string}  [params.category]
 * @param {string}  [params.search]
 * @param {boolean} [params.featured]
 * @param {string}  [params.city="Kochi"]
 * @param {number}  [params.page=1]
 * @param {number}  [params.limit=20]
 * @param {string}  [params.sort="rating"]
 * @returns {Promise<{ venues: object[], total: number, page: number, pages: number }>}
 */
export const getVenues = async (params = {}) => {
  try {
    const { data } = await API.get("/", { params });
    return {
      venues: data?.venues || [],
      total: data?.total || 0,
      page: data?.page || 1,
      pages: data?.pages || 1,
    };
  } catch (err) {
    return handleApiError(err);
  }
};

export default {
  getVenuesByCategory,
  getVenueById,
  getCategories,
  getFeaturedVenues,
  getVenues,
};
