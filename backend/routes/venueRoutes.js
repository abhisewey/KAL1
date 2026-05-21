import express from "express";
import protect from "../middleware/authMiddleware.js";

// ── Single controller source — src/controllers has the full cache-first pipeline ──
import {
  // Public — cache-first Overpass pipeline
  getVenuesByCategory,
  getVenueById,
  getCategories,
  getFeaturedVenues,

  // Public — paginated list from MongoDB directly
  getVenues,

  // Protected — admin operations
  createVenue,
  seedVenues,
  updateVenue,
  deleteVenue,
  refreshAllVenues,
} from "../src/controllers/venueController.js";

const router = express.Router();

// ── Helper: check if a string looks like a 24-char MongoDB ObjectId ──
const isObjectId = (str) => /^[0-9a-fA-F]{24}$/.test(str);

// ═══════════════════════════════════════════════════════════════════════════
//  PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/venues
// Paginated list from MongoDB with optional ?category, ?featured, ?sort, ?limit
router.get("/", getVenues);

// GET /api/venues/featured
// All featured venues (auto-promotes top-rated per category when none set)
router.get("/featured", getFeaturedVenues);

// GET /api/venues/categories
// Merged: Overpass config keys + distinct values from MongoDB
router.get("/categories", getCategories);

// GET /api/venues/details/:id
// Backward compatible endpoint for single venue by MongoDB _id.
router.get("/details/:id", getVenueById);

// GET /api/venues/:param
// ★ Smart catch-all — dispatches to the correct handler:
//   • If param is a 24-char hex string → getVenueById (single venue lookup)
//   • Otherwise → getVenuesByCategory (cache-first Overpass pipeline)
//
// This replaces the old /:id([0-9a-fA-F]{24}) regex syntax that crashes on
// modern Express / path-to-regexp versions.
router.get("/:param", (req, res, next) => {
  if (isObjectId(req.params.param)) {
    // Re-map to req.params.id so the controller reads it correctly
    req.params.id = req.params.param;
    return getVenueById(req, res, next);
  }
  // Re-map to req.params.category so the controller reads it correctly
  req.params.category = req.params.param;
  return getVenuesByCategory(req, res, next);
});

// ═══════════════════════════════════════════════════════════════════════════
//  PROTECTED ROUTES  (require valid JWT via protect middleware)
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/venues
// Create a single venue document manually
router.post("/", protect, createVenue);

// POST /api/venues/seed
// Bulk upsert an array of venue documents (idempotent).
// Body: { venues: [...] }
router.post("/seed", protect, seedVenues);

// POST /api/venues/refresh
// Force-refresh ALL categories from Overpass API sequentially.
// Useful for admin-triggered syncs or scheduled cron jobs.
router.post("/refresh", protect, refreshAllVenues);

// PUT /api/venues/:id
// Update a venue field by MongoDB _id
router.put("/:id", protect, updateVenue);

// DELETE /api/venues/:id
// Hard-delete a venue by MongoDB _id
router.delete("/:id", protect, deleteVenue);

export default router;

