import axios from "axios";

// ═══════════════════════════════════════════════════════════════════════════
//  overpassService.js
//
//  Fetches sports / recreational venue data from the OpenStreetMap Overpass API
//  for the Ernakulam / Kochi metropolitan area, normalises it, and returns
//  documents matching the Venue schema.
//
//  Public API:
//    fetchVenuesByCategory(category)  → Promise<VenueDoc[]>
//    fetchAllCategories()             → Promise<VenueDoc[]>
// ═══════════════════════════════════════════════════════════════════════════

// ── Constants ─────────────────────────────────────────────────────────────

/** Overpass public endpoint */
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

/** Timeout in milliseconds (Overpass queries can take up to 45-60 seconds on public instances) */
const REQUEST_TIMEOUT_MS = 60_000;

/**
 * Reference point for distance calculation (Ernakulam city centre).
 * Used when computing the "distance" string for each venue.
 */
const REFERENCE_LAT = 9.9816;
const REFERENCE_LNG = 76.2999;

// ── Category → Overpass query mapping ─────────────────────────────────────

const CATEGORY_CONFIG = {
  cricket: {
    label: "Cricket",
    tags: [
      '["sport"="cricket"]',
      '["leisure"="pitch"]["sport"="cricket"]',
    ],
    image:
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800",
    description:
      "A well-maintained cricket ground in the Kochi area featuring quality pitches and practice nets. Perfect for weekend matches and serious training sessions.",
    amenities: ["Practice Nets", "Pavilion", "Drinking Water", "Parking", "Washrooms"],
    venueType: "Ground",
  },
  football: {
    label: "Football",
    tags: [
      '["sport"="soccer"]',
      '["sport"="football"]',
      '["leisure"="pitch"]["sport"="soccer"]',
    ],
    image:
      "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=800",
    description:
      "A popular football venue in Kochi offering well-kept turf and ample space for 5-a-side and full matches. Great for weekend leagues and casual kick-abouts.",
    amenities: ["Floodlights", "Changing Rooms", "Parking", "Drinking Water", "Washrooms"],
    venueType: "Turf",
  },
  badminton: {
    label: "Badminton",
    tags: [
      '["sport"="badminton"]',
      '["leisure"="sports_centre"]["sport"="badminton"]',
    ],
    image:
      "https://images.unsplash.com/photo-1626224583760-4bfc36b13e9a?auto=format&fit=crop&q=80&w=800",
    description:
      "An indoor badminton facility near Kochi with professional-grade courts and proper lighting. Ideal for casual games and competitive practice.",
    amenities: ["Indoor Courts", "Lighting", "Restrooms", "Drinking Water", "Parking"],
    venueType: "Sports Centre",
  },
  basketball: {
    label: "Basketball",
    tags: [
      '["sport"="basketball"]',
      '["leisure"="pitch"]["sport"="basketball"]',
    ],
    image:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800",
    description:
      "An outdoor basketball court in the Kochi area with a quality playing surface. Perfect for pickup games, 3v3 matches, and shooting drills.",
    amenities: ["Outdoor Court", "Night Lights", "Drinking Water", "Parking"],
    venueType: "Court",
  },
  tennis: {
    label: "Tennis",
    tags: [
      '["sport"="tennis"]',
      '["leisure"="pitch"]["sport"="tennis"]',
    ],
    image:
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800",
    description:
      "A professional tennis facility in Ernakulam with well-maintained courts. Suitable for recreational play and competitive training alike.",
    amenities: ["Hard Court", "Floodlights", "Coaching Available", "Parking", "Restrooms"],
    venueType: "Club",
  },
  swimming: {
    label: "Swimming",
    tags: [
      '["sport"="swimming"]',
      '["leisure"="swimming_pool"]',
      '["amenity"="swimming_pool"]',
    ],
    image:
      "https://images.unsplash.com/photo-1519315901367-f34f927e1088?auto=format&fit=crop&q=80&w=800",
    description:
      "A clean and well-maintained swimming pool in the Kochi metropolitan area. Open for lap swimming, training sessions, and recreational use.",
    amenities: ["Changing Rooms", "Showers", "Lifeguard", "Parking", "Locker Rooms"],
    venueType: "Pool",
  },
  gym: {
    label: "Gym & Fitness",
    tags: [
      '["leisure"="fitness_centre"]',
      '["amenity"="gym"]',
      '["sport"="fitness"]',
    ],
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
    description:
      "A modern fitness centre in Kochi equipped with cardio machines, free weights, and functional training areas. Great for all fitness levels.",
    amenities: ["Cardio Equipment", "Free Weights", "Showers", "Locker Rooms", "Air Conditioned"],
    venueType: "Fitness Centre",
  },
  volleyball: {
    label: "Volleyball",
    tags: [
      '["sport"="volleyball"]',
      '["leisure"="pitch"]["sport"="volleyball"]',
    ],
    image:
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=800",
    description:
      "A dedicated volleyball court in the Kochi area. Well-suited for team practice, friendly matches, and local tournaments.",
    amenities: ["Sand/Hard Court", "Net Provided", "Floodlights", "Drinking Water", "Parking"],
    venueType: "Court",
  },
  hockey: {
    label: "Hockey",
    tags: [
      '["sport"="hockey"]',
      '["sport"="field_hockey"]',
      '["leisure"="pitch"]["sport"="hockey"]',
    ],
    image:
      "https://images.unsplash.com/photo-1580748142356-48c6bd58bba0?auto=format&fit=crop&q=80&w=800",
    description:
      "A field hockey ground in the Ernakulam district. Suitable for team training, practice sessions, and local-level matches.",
    amenities: ["Astro Turf", "Changing Rooms", "Drinking Water", "Parking", "Washrooms"],
    venueType: "Ground",
  },
  athletics: {
    label: "Athletics & Running",
    tags: [
      '["sport"="athletics"]',
      '["sport"="running"]',
      '["leisure"="track"]',
      '["leisure"="pitch"]["sport"="athletics"]',
    ],
    image:
      "https://images.unsplash.com/photo-1461896836934-bbe910c5e47f?auto=format&fit=crop&q=80&w=800",
    description:
      "An athletics track and running facility in the Kochi area. Features standard lanes for sprints, distance running, and field events.",
    amenities: ["Running Track", "Field Events", "Changing Rooms", "Drinking Water", "Parking"],
    venueType: "Stadium",
  },
  yoga: {
    label: "Yoga & Wellness",
    tags: [
      '["sport"="yoga"]',
      '["leisure"="fitness_centre"]["sport"="yoga"]',
    ],
    image:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800",
    description:
      "A peaceful yoga and wellness studio in Kochi offering guided sessions and meditation. Ideal for all experience levels.",
    amenities: ["Indoor Hall", "Mats Provided", "Air Conditioned", "Parking", "Restrooms"],
    venueType: "Studio",
  },
  martial_arts: {
    label: "Martial Arts",
    tags: [
      '["sport"="martial_arts"]',
      '["sport"="karate"]',
      '["sport"="taekwondo"]',
      '["sport"="judo"]',
      '["leisure"="sports_centre"]["sport"="martial_arts"]',
    ],
    image:
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800",
    description:
      "A martial arts training centre in Kochi offering classes in various disciplines. Suitable for beginners and experienced practitioners.",
    amenities: ["Training Mats", "Equipment Provided", "Changing Rooms", "Parking", "Air Conditioned"],
    venueType: "Academy",
  },
};

// ── Dynamic query builder ────────────────────────────────────────────────

/**
 * Generates an Overpass QL query string based on category tags.
 * Supports area-based restrictions or coordinate bounding boxes.
 *
 * @param {string} category  - Sport category key
 * @param {string} [areaName] - Optional OSM area name (e.g., "Ernakulam")
 * @param {string} [bbox]     - Optional bounding box string (e.g., "9.85,76.15,10.15,76.45")
 * @returns {string} Overpass QL query string
 */
export function generateQuery(category, areaName = "Ernakulam", bbox = null) {
  const config = CATEGORY_CONFIG[category];
  if (!config) throw new Error(`Unknown category: ${category}`);

  let unions = "";
  if (areaName) {
    unions = config.tags
      .flatMap((tag) => [
        `  node${tag}(area.searchArea);`,
        `  way${tag}(area.searchArea);`,
        `  relation${tag}(area.searchArea);`
      ])
      .join("\n");
      
    return `
[out:json][timeout:30][maxsize:10485760];
area["name"="${areaName}"]->.searchArea;
(
${unions}
);
out center tags qt;
`.trim();
  } else if (bbox) {
    unions = config.tags
      .flatMap((tag) => [
        `  node${tag}(${bbox});`,
        `  way${tag}(${bbox});`,
        `  relation${tag}(${bbox});`
      ])
      .join("\n");

    return `
[out:json][timeout:30][maxsize:10485760];
(
${unions}
);
out center tags qt;
`.trim();
  } else {
    throw new Error("Either areaName or bbox must be specified to generate Overpass query.");
  }
}


// ── Distance calculations ─────────────────────────────────────────────────

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10;
}

// ── Parsers & normalisers ─────────────────────────────────────────────────

function extractName(tags, category, index) {
  const configLabel = CATEGORY_CONFIG[category]?.label || category || "Sports";
  return (
    tags?.["name:en"] ||
    tags?.name ||
    tags?.operator ||
    tags?.brand ||
    `${configLabel} Venue #${index + 1}`
  );
}

function extractAddress(tags) {
  const parts = [
    tags?.["addr:housename"],
    tags?.["addr:housenumber"],
    tags?.["addr:street"],
    tags?.["addr:suburb"] || tags?.["addr:neighbourhood"],
    tags?.["addr:city"] || "Kochi",
  ].filter(Boolean);

  return parts.length > 1 ? parts.join(", ") : "";
}

function extractCoords(element) {
  if (element.type === "node") {
    return { lat: element.lat, lng: element.lon };
  }
  if (element.center) {
    return { lat: element.center.lat, lng: element.center.lon };
  }
  return null;
}

function buildMapsLink(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function generateRating(osmId) {
  let hash = 0;
  const str = String(osmId);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 16) / 15;
  return Math.round((3.5 + normalized * 1.5) * 10) / 10;
}

function normaliseElement(element, category, index) {
  try {
    const coords = extractCoords(element);
    // Discard elements that lack valid coordinates
    if (!coords || typeof coords.lat !== "number" || typeof coords.lng !== "number") {
      return null;
    }

    const tags = element.tags || {};
    const osmId = `${element.type || "node"}/${element.id || "unknown"}`;
    
    // Provide a generic fallback config if the category config is missing
    const config = CATEGORY_CONFIG[category] || {
      label: category || "Sports",
      image: "https://images.unsplash.com/photo-1587280501635-a19de238a81e?auto=format&fit=crop&q=80&w=800",
      description: "A sports venue in the Kochi metropolitan area.",
      amenities: ["Parking", "Restrooms", "Drinking Water"],
      venueType: "Venue"
    };

    const name = extractName(tags, category, index) || "Unknown Venue";
    const distanceKm = haversineKm(
      REFERENCE_LAT,
      REFERENCE_LNG,
      coords.lat,
      coords.lng
    );

    // Apply strict type casting and fallbacks to guarantee data schema conformity
    return {
      osmId: String(osmId),
      name: String(name),
      sport: String(tags.sport || category),
      category: String(category),
      latitude: coords.lat,
      longitude: coords.lng,
      address: String(extractAddress(tags) || ""),
      locality: String(
        tags?.["addr:suburb"] ||
        tags?.["addr:neighbourhood"] ||
        tags?.["addr:district"] ||
        ""
      ),
      city: String(tags?.["addr:city"] || "Kochi"),
      state: "Kerala",
      image: String(config.image || "https://images.unsplash.com/photo-1587280501635-a19de238a81e?auto=format&fit=crop&q=80&w=800"),
      description: String(config.description?.replace("{{name}}", name) || `A ${config.label} venue.`),
      amenities: Array.isArray(config.amenities) ? config.amenities : [],
      rating: Number(generateRating(element.id || Math.random())),
      distance: `${distanceKm} km`,
      openingHours: String(tags?.opening_hours || "Contact for hours"),
      phone: String(tags?.phone || tags?.["contact:phone"] || "Not Available"),
      website: String(tags?.website || tags?.["contact:website"] || ""),
      featured: false,
      venueType: String(config.venueType || "Facility"),
      mapsLink: buildMapsLink(coords.lat, coords.lng),
      fetchedAt: new Date(),
    };
  } catch (error) {
    console.error(`[Overpass] Normalization error for element ${element?.id}:`, error.message);
    return null;
  }
}

// ── Public API Fetch Pipeline ─────────────────────────────────────────────

/**
 * Fetches venues from the Overpass API using a dynamic area lookup query.
 * Falls back to a bounding box query if the area search yields zero results.
 *
 * @param {string} category - Sport category matching config keys
 * @returns {Promise<object[]>} Array of normalized venues
 */
export async function fetchVenuesByCategory(category) {
  const catKey = category.toLowerCase().trim();

  if (!CATEGORY_CONFIG[catKey]) {
    throw new Error(
      `Unknown category "${category}". Available: ${Object.keys(CATEGORY_CONFIG).join(", ")}`
    );
  }

  const executeQuery = async (qlQuery) => {
    return axios.post(
      OVERPASS_URL,
      `data=${encodeURIComponent(qlQuery)}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "User-Agent": "KALI-Venue-App/1.0 (contact@kali-app.com; github.com/abhisewey/KALI)",
        },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );
  };

  let responseData = null;
  let queryUsed = "";

  try {
    // 1. Primary Attempt: Area-based query restricting search to Ernakulam
    queryUsed = generateQuery(catKey, "Ernakulam");
    console.log(`[Overpass] [DEBUG] Running primary area query for "${catKey}":`);
    console.log(queryUsed);

    const primaryResponse = await executeQuery(queryUsed);
    console.log(`[Overpass] [DEBUG] Primary response status: ${primaryResponse.status}`);
    
    if (primaryResponse.data?.elements && primaryResponse.data.elements.length > 0) {
      responseData = primaryResponse.data;
    } else {
      console.log(`[Overpass] Primary area query returned 0 elements. Attempting fallback...`);
    }
  } catch (err) {
    console.warn(`[Overpass] Primary area query failed/timed out: ${err.message}. Attempting fallback...`);
  }

  // 2. Fallback Attempt: Bounding Box query covering Kochi metro area
  if (!responseData) {
    try {
      const KOCHI_BBOX = "9.85,76.15,10.15,76.45";
      queryUsed = generateQuery(catKey, null, KOCHI_BBOX);
      console.log(`[Overpass] [DEBUG] Running fallback bounding box query for "${catKey}":`);
      console.log(queryUsed);

      const fallbackResponse = await executeQuery(queryUsed);
      console.log(`[Overpass] [DEBUG] Fallback response status: ${fallbackResponse.status}`);
      responseData = fallbackResponse.data;
    } catch (err) {
      console.error(`[Overpass] [ERROR] Fallback query also failed.`);
      // Parse error from fallback attempt to throw descriptive exception
      if (err.response) {
        const status = err.response.status;
        if (status === 406) {
          throw new Error(`[Overpass] Syntax Error (406) on query. Category: "${catKey}"`);
        }
        if (status === 429) {
          throw new Error(`[Overpass] Rate Limit Error (429): API server throttling.`);
        }
        throw new Error(`[Overpass] API error (${status}): ${err.response.statusText}`);
      }
      if (err.code === "ECONNABORTED") {
        throw new Error(`[Overpass] Timeout Error: API did not respond within ${REQUEST_TIMEOUT_MS / 1000}s.`);
      }
      throw new Error(`[Overpass] Connection Error: ${err.message}`);
    }
  }

  if (responseData?.elements && responseData.elements.length > 0) {
    console.log(`[Overpass] [DEBUG] Sample element payload:`, JSON.stringify(responseData.elements[0], null, 2));
  }

  if (!responseData || !responseData.elements) {
    return [];
  }

  const venues = responseData.elements
    .map((el, i) => normaliseElement(el, catKey, i))
    .filter(Boolean);

  console.log(`[Overpass] Normalized category "${catKey}" → returned ${venues.length} venues.`);
  return venues;
}


/**
 * Sequential categories fetch wrapper to safeguard public instance resources.
 */
export async function fetchAllCategories() {
  const categories = Object.keys(CATEGORY_CONFIG);
  const all = [];

  console.log(`[Overpass] Starting full fetch across ${categories.length} categories...`);

  for (const cat of categories) {
    try {
      const venues = await fetchVenuesByCategory(cat);
      all.push(...venues);
      
      if (categories.indexOf(cat) < categories.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (err) {
      console.error(`[Overpass] Skipping category "${cat}" due to error: ${err.message}`);
    }
  }

  console.log(`[Overpass] Full category fetch done. Total: ${all.length} venues.`);
  return all;
}

export function getAvailableCategories() {
  return Object.keys(CATEGORY_CONFIG);
}

export function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category?.toLowerCase()?.trim()];
}

export default {
  fetchVenuesByCategory,
  fetchAllCategories,
  getAvailableCategories,
  getCategoryConfig,
  generateQuery,
};

