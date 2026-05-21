import Venue from "../models/Venue.js";

// ─────────────────────────────────────────────────────────────
//  GET /api/venues
//  Public — paginated list with optional filters
//
//  Query params:
//    category   filter by sport category (case-insensitive)
//    featured   "true" → only featured venues
//    city       filter by city (default: Kochi)
//    page       page number, 1-indexed  (default: 1)
//    limit      results per page        (default: 20, max: 100)
//    sort       "rating" | "name"       (default: rating desc)
// ─────────────────────────────────────────────────────────────
export const getVenues = async (req, res) => {
  try {
    const {
      category,
      featured,
      city = "Kochi",
      page = 1,
      limit = 20,
      sort = "rating",
    } = req.query;

    // Build query filter
    const filter = { city };
    if (category) filter.category = category.toLowerCase();
    if (featured === "true") filter.featured = true;

    // Clamp limit to prevent abuse
    const pageSize = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * pageSize;

    // Sort direction
    const sortOption = sort === "name" ? { name: 1 } : { rating: -1 };

    const [venues, total] = await Promise.all([
      Venue.find(filter).sort(sortOption).skip(skip).limit(pageSize).lean(),
      Venue.countDocuments(filter),
    ]);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / pageSize),
      venues,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET /api/venues/featured
//  Public — returns all featured venues (no pagination)
// ─────────────────────────────────────────────────────────────
export const getFeaturedVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ featured: true })
      .sort({ rating: -1 })
      .lean();
    res.json(venues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET /api/venues/categories
//  Public — returns distinct category names in the DB
// ─────────────────────────────────────────────────────────────
export const getCategories = async (req, res) => {
  try {
    const categories = await Venue.distinct("category");
    res.json(categories.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET /api/venues/:id
//  Public — single venue by Mongo _id
// ─────────────────────────────────────────────────────────────
export const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id).lean();
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  POST /api/venues
//  Protected (admin) — create a single venue
// ─────────────────────────────────────────────────────────────
export const createVenue = async (req, res) => {
  try {
    const venue = await Venue.create(req.body);
    res.status(201).json(venue);
  } catch (err) {
    // Duplicate osmId + category
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Venue with this osmId and category already exists" });
    }
    res.status(400).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  POST /api/venues/seed
//  Protected (admin) — bulk upsert an array of venues
//  Body: { venues: [...] }
//
//  Uses updateOne + upsert on osmId+category so re-running
//  the seeder is always safe (idempotent).
// ─────────────────────────────────────────────────────────────
export const seedVenues = async (req, res) => {
  try {
    const { venues } = req.body;

    if (!Array.isArray(venues) || venues.length === 0) {
      return res
        .status(400)
        .json({ message: "Provide a non-empty venues array" });
    }

    const ops = venues.map((v) => ({
      updateOne: {
        filter: { osmId: v.osmId, category: v.category },
        update: { $set: v },
        upsert: true,
      },
    }));

    const result = await Venue.bulkWrite(ops, { ordered: false });

    res.json({
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      total: venues.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  PUT /api/venues/:id
//  Protected (admin) — update a venue
// ─────────────────────────────────────────────────────────────
export const updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    res.json(venue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  DELETE /api/venues/:id
//  Protected (admin) — soft-delete via isActive flag (future)
//  or hard delete (current)
// ─────────────────────────────────────────────────────────────
export const deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    res.json({ message: "Venue deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
