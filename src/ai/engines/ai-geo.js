// /ai-engine/ai-geo.js
// GIA Sovereign Geo Engine – V12 Alpha

import { validatePayload } from "./utils/validator.js";
import { sanitizeOutput } from "./response-sanitizer.js";
import { handleError } from "./error-handler.js";
import { buildContext } from "./context-builder.js";

export async function runGeoTask(input = {}, env = {}) {
  //
  // 1. Validate input schema
  //
  const schemaCheck = await validatePayload(env, input, {
    text: { required: true, type: "string" },
    trustZone: { required: false, type: "string" },
    workflow: { required: false, type: "string" }
  });

  if (!schemaCheck.ok) return schemaCheck;

  //
  // 2. Build sovereign execution context
  //
  const context = await buildContext(input, env);

  //
  // 3. Execute geo logic
  //
  let result;
  try {
    result = await executeGeo(input.text);
  } catch (err) {
    return handleError(err, env, { geo: true, input });
  }

  //
  // 4. Sanitize output
  //
  const sanitized = await sanitizeOutput(
    {
      type: "geo",
      content: result.message,
      meta: result.meta
    },
    env,
    context
  );

  //
  // 5. Return sovereign‑grade geo output
  //
  return sanitized;
}

//
// --- INTERNAL GEO ENGINE ----------------------------------------------------
//

async function executeGeo(text) {
  const t = text.trim().toLowerCase();

  //
  // Distance calculation: "distance 40.1,-80.2 to 41.2,-79.9"
  //
  if (t.startsWith("distance")) {
    const coords = extractCoordinates(t);
    if (coords.length === 2) {
      const km = haversine(coords[0], coords[1]);
      return {
        message: `Distance between points is ${km.toFixed(2)} km`,
        meta: { coords, km }
      };
    }
  }

  //
  // Coordinate normalization: "normalize 40.123 -80.456"
  //
  if (t.startsWith("normalize")) {
    const coords = extractCoordinates(t);
    if (coords.length === 1) {
      return {
        message: `Normalized coordinates: ${coords[0].lat}, ${coords[0].lon}`,
        meta: { coords }
      };
    }
  }

  //
  // Region detection: "where is 40.44,-79.99"
  //
  if (t.startsWith("where")) {
    const coords = extractCoordinates(t);
    if (coords.length === 1) {
      return {
        message: `Coordinates appear to be in the region of ${guessRegion(coords[0])}`,
        meta: { coords }
      };
    }
  }

  //
  // Default fallback
  //
  return {
    message: `Geo engine processed: ${text}`,
    meta: {}
  };
}

//
// --- GEO HELPERS ------------------------------------------------------------
//

function extractCoordinates(text) {
  const regex = /(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/g;
  const matches = [...text.matchAll(regex)];
  return matches.map(m => ({
    lat: parseFloat(m[1]),
    lon: parseFloat(m[2])
  }));
}

function haversine(a, b) {
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function guessRegion({ lat, lon }) {
  if (lat > 24 && lat < 50 && lon > -125 && lon < -66) return "United States";
  if (lat > 35 && lat < 70 && lon > -10 && lon < 40) return "Europe";
  if (lat > -45 && lat < 10 && lon > 110 && lon < 155) return "Australia region";
  return "Unknown region";
}

