import Venue from "../../models/Venue.js";
import {
  fetchVenuesByCategory as fetchFromOverpass,
  fetchAllCategories as fetchAllFromOverpass,
  getAvailableCategories,
} from "../services/overpassService.js";

// ═══════════════════════════════════════════════════════════════════════════
//  src/controllers/venueController.js
//
//  Cache-first data pipeline:
//    Request → MongoDB cache check → (stale/miss) Overpass API → MongoDB save
//
//  Response envelope (all endpoints):
//    { success: bool, source: string, total: number, venues: [], message?: string }
//
//  Cache TTL  : 24 hours  (based on newest `fetchedAt` timestamp per category)
//  Write mode : bulkWrite upsert on (osmId + category) — always idempotent
// ═══════════════════════════════════════════════════════════════════════════

/** Cache duration — venues are considered fresh for 24 hours */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────
//  Helper: consistent response sender
// ─────────────────────────────────────────────────────────────────────────
const ok = (res, data) => res.json({ success: true, ...data });
const fail = (res, status, message, devErr) =>
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && devErr
      ? { error: devErr }
      : {}),
  });

// ─────────────────────────────────────────────────────────────────────────
//  GET /api/venues/category/:category
//
//  Cache-first pipeline:
//    1. Validate category against Overpass config
//    2. Check MongoDB for fresh data (age < 24 h)
//    3a. Cache HIT  → return cached data immediately
//    3b. Cache MISS / stale → fetch from Overpass
//       → if Overpass succeeds: upsert to MongoDB, return fresh data
//       → if Overpass FAILS:    gracefully return stale cache (if any)
//
//  Query params:
//    force=true   bypass cache, always fetch from Overpass
//    sort         "rating" | "name" | "distance"  (default: rating)
//    limit        integer — max venues to return   (default: all)
// ─────────────────────────────────────────────────────────────────────────
export const getVenuesByCategory = async (req, res) => {
  const label = "[VenueCtrl] getVenuesByCategory";
  const category = req.params.category?.toLowerCase().trim();

  console.log(`\n${label} → requested category: "${category}"`);

  // ── 1. Validate ─────────────────────────────────────────────────────────
  const validCategories = getAvailableCategories();
  if (!category || !validCategories.includes(category)) {
    console.warn(`${label} → invalid category "${category}"`);
    return fail(
      res,
      400,
      `Invalid category "${category}". Available: ${validCategories.join(", ")}`
    );
  }

  const forceRefresh = req.query.force === "true";
  const sortBy = req.query.sort || "rating";
  const limit = req.query.limit ? Number(req.query.limit) : 0;
  const search = req.query.search?.trim().toLowerCase() || "";

  let venues = null;
  let source = null;

  // ── 2. MongoDB cache check ───────────────────────────────────────────────
  if (!forceRefresh) {
    const cached = await getCachedVenues(category);
    console.log(
      `${label} → cache check: ${cached.venues.length} docs, age: ${cached.ageMinutes}m, stale: ${cached.isStale}`
    );

    if (cached.venues.length > 0 && !cached.isStale) {
      venues = cached.venues;
      source = "cache";
      console.log(`${label} → Cache HIT — serving ${venues.length} venues from MongoDB.`);
    } else if (cached.venues.length > 0 && cached.isStale) {
      console.log(`${label} → Cache STALE — will try Overpass, keeping stale data as fallback.`);
    } else {
      console.log(`${label} → Cache MISS — no data in MongoDB for this category.`);
    }
  } else {
    console.log(`${label} → Force refresh requested — bypassing cache.`);
  }

  // ── 3. Overpass fetch (on cache miss / stale / forced) ──────────────────
  if (!venues) {
    let overpassVenues = null;
    let overpassError = null;

    try {
      console.log(`${label} → Calling Overpass API for "${category}"...`);
      overpassVenues = await fetchFromOverpass(category);
      console.log(`${label} → Overpass returned ${overpassVenues.length} venues.`);
    } catch (err) {
      overpassError = err.message;
      console.error(`${label} → Overpass FAILED: ${err.message}`);
    }

    // ── 3a. Overpass succeeded ───────────────────────────────────────────
    if (overpassVenues && overpassVenues.length > 0) {
      try {
        const writeResult = await upsertVenues(overpassVenues);
        console.log(
          `${label} → Upserted: ${writeResult.upsertedCount} new, ${writeResult.modifiedCount} updated.`
        );
      } catch (dbErr) {
        // Non-fatal: log but still return the fresh Overpass data
        console.error(`${label} → MongoDB upsert error (non-fatal): ${dbErr.message}`);
      }
      venues = overpassVenues;
      source = "overpass";

    // ── 3b. Overpass returned empty ──────────────────────────────────────
    } else if (overpassVenues && overpassVenues.length === 0) {
      console.warn(`${label} → Overpass returned 0 results. Falling back to any cached data.`);
      const fallback = await Venue.find({ category }).sort({ rating: -1 }).lean();
      return ok(res, {
        source: "cache-fallback",
        total: fallback.length,
        venues: applySortAndLimit(fallback, sortBy, limit),
        message: "Overpass returned no results. Showing previously cached data.",
      });

    // ── 3c. Overpass threw an error — graceful stale-cache fallback ───────
    } else if (overpassError) {
      console.warn(`${label} → Attempting graceful fallback to stale cache...`);
      const stale = await Venue.find({ category }).sort({ rating: -1 }).lean();

      if (stale.length > 0) {
        console.log(`${label} → Stale cache fallback successful — ${stale.length} venues.`);
        return ok(res, {
          source: "cache-stale",
          total: stale.length,
          venues: applySortAndLimit(stale, sortBy, limit),
          message: "Live data temporarily unavailable. Showing cached data.",
        });
      }

      // Nothing in cache either — hard fail
      console.error(`${label} → No cache fallback available. Returning 503.`);
      return fail(
        res,
        503,
        "Venue data is temporarily unavailable. Please try again shortly.",
        overpassError
      );
    }
  }

  // ── 4. Search, Sort, limit, respond ──────────────────────────────────────
  let filtered = venues || [];
  if (search) {
    filtered = filtered.filter(
      (v) =>
        v.name?.toLowerCase().includes(search) ||
        v.locality?.toLowerCase().includes(search)
    );
  }

  const result = applySortAndLimit(filtered, sortBy, limit);
  console.log(`${label} → Responding with ${result.length} venues (source: ${source}).\n`);

  return ok(res, { source, total: result.length, venues: result });
};

// ─────────────────────────────────────────────────────────────────────────
//  GET /api/venues
//
//  Public — paginated list with optional filters.
//  Query params: category, featured, city, page, limit, sort
// ─────────────────────────────────────────────────────────────────────────
export const getVenues = async (req, res) => {
  const label = "[VenueCtrl] getVenues";
  try {
    const {
      category,
      featured,
      search,
      city = "Kochi",
      page = 1,
      limit = 20,
      sort = "rating",
    } = req.query;

    const filter = { city };
    if (category) filter.category = category.toLowerCase();
    if (featured === "true") filter.featured = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { locality: { $regex: search, $options: "i" } },
      ];
    }

    const pageSize = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * pageSize;
    
    let sortOption = { rating: -1 };
    if (sort === "name") sortOption = { name: 1 };
    else if (sort === "distance") sortOption = { distance: 1 };
    else if (sort === "featured") sortOption = { featured: -1, rating: -1 };

    console.log(`${label} → filter: ${JSON.stringify(filter)}, page: ${page}, limit: ${pageSize}`);

    const [venues, total] = await Promise.all([
      Venue.find(filter).sort(sortOption).skip(skip).limit(pageSize).lean(),
      Venue.countDocuments(filter),
    ]);

    console.log(`${label} → returned ${venues.length} of ${total} total.`);

    return ok(res, {
      source: "cache",
      total,
      page: Number(page),
      pages: Math.ceil(total / pageSize),
      venues,
    });
  } catch (err) {
    console.error(`${label} error:`, err.message);
    return fail(res, 500, "Failed to fetch venues.", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────
//  GET /api/venues/:id
//
//  Public — single venue by MongoDB _id.
// ─────────────────────────────────────────────────────────────────────────
export const getVenueById = async (req, res) => {
  const label = "[VenueCtrl] getVenueById";
  try {
    const { id } = req.params;
    console.log(`${label} → id: ${id}`);

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return fail(res, 400, "Invalid venue ID format.");
    }

    const venue = await Venue.findById(id).lean();
    if (!venue) {
      console.warn(`${label} → venue not found for id: ${id}`);
      return fail(res, 404, "Venue not found.");
    }

    console.log(`${label} → found: "${venue.name}"`);
    return ok(res, { source: "cache", venue });
  } catch (err) {
    console.error(`${label} error:`, err.message);
    return fail(res, 500, "Failed to fetch venue details.", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────
//  GET /api/venues/featured
//
//  Public — featured venues, auto-promotes top-rated if none explicitly set.
// ─────────────────────────────────────────────────────────────────────────
export const getFeaturedVenues = async (req, res) => {
  const label = "[VenueCtrl] getFeaturedVenues";
  try {
    // 1. Fetch from MongoDB cache with rating >= 4.2, sorted by featured then rating, limit to 8
    let venues = await Venue.find({ rating: { $gte: 4.2 } })
      .sort({ featured: -1, rating: -1 })
      .limit(8)
      .lean();

    console.log(`${label} → fetched ${venues.length} featured/top-rated venues from cache.`);

    // 2. Cache refresh logic: If count is 0 (Cache miss or empty DB), attempt to seed/fetch key categories
    if (venues.length === 0) {
      console.log(`${label} → Cache empty or no high-rated venues. Attempting background fetch of default categories...`);
      const defaultCats = ["football", "cricket", "badminton"];
      
      for (const cat of defaultCats) {
        try {
          const fresh = await fetchFromOverpass(cat);
          if (fresh && fresh.length > 0) {
            await upsertVenues(fresh);
          }
        } catch (err) {
          console.warn(`${label} → Background refresh failed for category "${cat}": ${err.message}`);
        }
      }
      
      // Query again after the refresh
      venues = await Venue.find({ rating: { $gte: 4.2 } })
        .sort({ featured: -1, rating: -1 })
        .limit(8)
        .lean();
    }

    // 3. Graceful fallback: If still empty (e.g. Overpass API offline/throttled), relax filter to return any available venues
    if (venues.length === 0) {
      console.log(`${label} → Relaxing criteria for graceful fallback.`);
      venues = await Venue.find({})
        .sort({ featured: -1, rating: -1 })
        .limit(8)
        .lean();
    }

    return ok(res, { source: "cache", total: venues.length, venues });
  } catch (err) {
    console.error(`${label} error:`, err.message);
    return fail(res, 500, "Failed to fetch featured venues.", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────
//  GET /api/venues/categories
//
//  Public — merged list of Overpass config keys + DB distinct values.
// ─────────────────────────────────────────────────────────────────────────
export const getCategories = async (req, res) => {
  const label = "[VenueCtrl] getCategories";
  try {
    const overpassCats = getAvailableCategories();
    const dbCats = await Venue.distinct("category");
    const all = [...new Set([...overpassCats, ...dbCats])].sort();
    console.log(`${label} → ${all.length} categories (${overpassCats.length} Overpass + ${dbCats.length} DB)`);
    return ok(res, { total: all.length, categories: all });
  } catch (err) {
    console.error(`${label} error:`, err.message);
    return fail(res, 500, "Failed to fetch categories.", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────
//  POST /api/venues/refresh  (protected)
//
//  Force-refresh ALL categories from Overpass — sequential with polite delay.
// ─────────────────────────────────────────────────────────────────────────
export const refreshAllVenues = async (req, res) => {
  const label = "[VenueCtrl] refreshAllVenues";
  console.log(`\n${label} → Starting full refresh...`);

  try {
    const categories = getAvailableCategories();
    const results = {};
    let totalVenues = 0;

    for (const cat of categories) {
      try {
        console.log(`${label} → Fetching "${cat}"...`);
        const venues = await fetchFromOverpass(cat);

        if (venues.length > 0) {
          const writeResult = await upsertVenues(venues);
          results[cat] = {
            fetched: venues.length,
            upserted: writeResult.upsertedCount,
            modified: writeResult.modifiedCount,
          };
          totalVenues += venues.length;
          console.log(`${label} → "${cat}": ${venues.length} venues saved.`);
        } else {
          results[cat] = { fetched: 0, note: "No results from Overpass" };
          console.warn(`${label} → "${cat}": Overpass returned 0 results.`);
        }

        await delay(2000); // Polite delay between categories
      } catch (err) {
        results[cat] = { error: err.message };
        console.error(`${label} → "${cat}" FAILED: ${err.message}`);
      }
    }

    console.log(`${label} → Done. Total: ${totalVenues} venues across ${categories.length} categories.\n`);

    return ok(res, {
      message: "Full venue refresh completed.",
      totalCategories: categories.length,
      totalVenues,
      details: results,
    });
  } catch (err) {
    console.error(`${label} error:`, err.message);
    return fail(res, 500, "Failed to complete venue refresh.", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────
//  POST /api/venues  (protected)
//  Create a single venue
// ─────────────────────────────────────────────────────────────────────────
export const createVenue = async (req, res) => {
  const label = "[VenueCtrl] createVenue";
  try {
    const venue = await Venue.create(req.body);
    console.log(`${label} → created: ${venue._id}`);
    return res.status(201).json({ success: true, venue });
  } catch (err) {
    if (err.code === 11000) {
      return fail(res, 409, "Venue with this osmId and category already exists.");
    }
    console.error(`${label} error:`, err.message);
    return fail(res, 400, err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────
//  POST /api/venues/seed  (protected)
//  Bulk upsert — Body: { venues: [...] }
// ─────────────────────────────────────────────────────────────────────────
export const seedVenues = async (req, res) => {
  const label = "[VenueCtrl] seedVenues";
  try {
    const { venues } = req.body;
    if (!Array.isArray(venues) || venues.length === 0) {
      return fail(res, 400, "Provide a non-empty venues array.");
    }
    console.log(`${label} → seeding ${venues.length} venues...`);
    const result = await upsertVenues(venues);
    return ok(res, {
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      total: venues.length,
    });
  } catch (err) {
    console.error(`${label} error:`, err.message);
    return fail(res, 500, "Seed operation failed.", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────
//  PUT /api/venues/:id  (protected)
// ─────────────────────────────────────────────────────────────────────────
export const updateVenue = async (req, res) => {
  const label = "[VenueCtrl] updateVenue";
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!venue) return fail(res, 404, "Venue not found.");
    console.log(`${label} → updated: ${venue._id}`);
    return ok(res, { venue });
  } catch (err) {
    console.error(`${label} error:`, err.message);
    return fail(res, 400, err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────
//  DELETE /api/venues/:id  (protected)
// ─────────────────────────────────────────────────────────────────────────
export const deleteVenue = async (req, res) => {
  const label = "[VenueCtrl] deleteVenue";
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) return fail(res, 404, "Venue not found.");
    console.log(`${label} → deleted: ${req.params.id}`);
    return ok(res, { message: "Venue deleted successfully." });
  } catch (err) {
    console.error(`${label} error:`, err.message);
    return fail(res, 500, "Failed to delete venue.", err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Checks MongoDB for cached venues and determines staleness.
 */
async function getCachedVenues(category) {
  const venues = await Venue.find({ category }).lean();
  if (venues.length === 0) {
    return { venues: [], isStale: true, ageMinutes: Infinity };
  }
  const newestFetch = venues.reduce((latest, v) => {
    const t = v.fetchedAt ? new Date(v.fetchedAt).getTime() : 0;
    return t > latest ? t : latest;
  }, 0);
  const ageMs = Date.now() - newestFetch;
  return {
    venues,
    isStale: ageMs > CACHE_TTL_MS,
    ageMinutes: Math.round(ageMs / 60_000),
  };
}

/**
 * Bulk upserts normalised venue docs using (osmId + category) as composite key.
 */
async function upsertVenues(venues) {
  const ops = venues.map((v) => ({
    updateOne: {
      filter: { osmId: v.osmId, category: v.category },
      update: { $set: v },
      upsert: true,
    },
  }));
  return Venue.bulkWrite(ops, { ordered: false });
}

/**
 * Sorts a venues array by the specified field and optionally limits results.
 */
function applySortAndLimit(venues, sortBy, limit) {
  let sorted;
  switch (sortBy) {
    case "name":
      sorted = [...venues].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "distance":
      sorted = [...venues].sort((a, b) => {
        const da = parseFloat(a.distance) || 999;
        const db = parseFloat(b.distance) || 999;
        return da - db;
      });
      break;
    case "featured":
      sorted = [...venues].sort((a, b) => {
        if (a.featured === b.featured) return (b.rating || 0) - (a.rating || 0);
        return a.featured ? -1 : 1;
      });
      break;
    case "rating":
    default:
      sorted = [...venues].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  return limit > 0 ? sorted.slice(0, limit) : sorted;
}

/** Promise-based delay */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default {
  getVenuesByCategory,
  getVenues,
  getVenueById,
  getCategories,
  getFeaturedVenues,
  refreshAllVenues,
  createVenue,
  seedVenues,
  updateVenue,
  deleteVenue,
};
