// /ai-engine/ai-matching.js
// GIA Sovereign Intent Engine – V12 Alpha

import { sha256 } from "../utils/context.js";

//
// Intent patterns — expanded for V12 Alpha
//
const INTENT_PATTERNS = [
  // Geo
  {
    intent: "geo",
    match: ["distance", "location", "nearby", "map", "coordinates", "lat", "lon"]
  },

  // Utility
  {
    intent: "utility",
    match: ["convert", "format", "parse", "clean", "normalize", "uppercase", "lowercase"]
  },

  // Decision
  {
    intent: "decision",
    match: ["should", "decide", "choose", "recommend", "pick"]
  },

  // Sandbox / Deep
  {
    intent: "sandbox",
    match: ["deep", "resonance", "gia", "core", "sandbox"]
  },

  // Science Engine
  {
    intent: "science",
    match: ["science", "physics", "chemistry", "materials", "energy science"]
  },

  // Geothermal Engine
  {
    intent: "geothermal",
    match: ["geothermal", "geo thermal", "heat well", "subsurface", "geothermal potential"]
  },

  // Renewables (Solar + Wind)
  {
    intent: "renewables",
    match: ["solar", "wind", "renewable", "pv", "turbine", "solar potential", "wind potential"]
  },

  // Building Code
  {
    intent: "building-code",
    match: ["building code", "ibc", "residential code", "commercial code", "fire separation"]
  },

  // Zoning
  {
    intent: "zoning",
    match: ["zoning", "zone", "r-1", "c-2", "m-1", "land use", "lot size"]
  }

  {
  intent: "sector-analysis",
  match: [
    "sector analysis",
    "analyze sector",
    "sector readiness",
    "sector risk",
    "sector report",
    "infrastructure sector",
    "government sector analysis"
  ]
}

];

const DEFAULT_INTENT = "general";

//
// Main intent matcher
//
export async function matchIntent(input = {}, context = {}) {
  const text = (input?.text || "").toLowerCase().trim();

  // 1. No text → fallback
  if (!text) {
    return buildIntentResult(DEFAULT_INTENT, text, context);
  }

  // 2. Pattern matching
  for (const pattern of INTENT_PATTERNS) {
    for (const keyword of pattern.match) {
      if (text.includes(keyword)) {
        return buildIntentResult(pattern.intent, text, context);
      }
    }
  }

  // 3. Trust‑zone overrides
  if (context.trustZone === "deepgov") {
    return buildIntentResult("sandbox", text, context);
  }

  if (context.trustZone === "gov") {
    return buildIntentResult("decision", text, context);
  }

  // 4. Workflow override
  if (input.workflow) {
    return buildIntentResult(input.workflow, text, context);
  }

  // 5. Fallback
  return buildIntentResult(DEFAULT_INTENT, text, context);
}

//
// Intent result wrapper
//
async function buildIntentResult(intent, text, context) {
  return {
    ok: true,
    intent,
    confidence: computeConfidence(intent),
    summary: text.slice(0, 120),
    trustZone: context.trustZone || "public",
    workflow: context.workflow || null,
    inputHash: await sha256(text),
    contextHash: context.contextHash || null,
    timestamp: new Date().toISOString()
  };
}

//
// Confidence model (simple V12 baseline)
//
function computeConfidence(intent) {
  switch (intent) {
    case "geo": return 0.95;
    case "utility": return 0.9;
    case "decision": return 0.85;
    case "sandbox": return 0.98;
    case "science": return 0.9;
    case "geothermal": return 0.92;
    case "renewables": return 0.93;
    case "building-code": return 0.9;
    case "zoning": return 0.9;
    default: return 0.5;
  }
}
