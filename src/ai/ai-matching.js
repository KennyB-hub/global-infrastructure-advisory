/**
 * AI Intent Matcher — V12 Alpha
 * Classifies user intent for the sovereign intelligence engine.
 */

export function matchSandboxIntent(query = "") {
  const text = query.toLowerCase();

  //
  // Core legacy intents
  //
  if (text.includes("geo") || text.includes("location") || text.includes("distance"))
    return "geo";

  if (text.includes("convert") || text.includes("format") || text.includes("utility"))
    return "utility";

  if (text.includes("resonance") || text.includes("deep") || text.includes("sandbox"))
    return "sandbox";

  if (text.includes("admin") || text.includes("verify") || text.includes("auth"))
    return "auth";

  //
  // NEW V12 Alpha Engineering & Mechanics
  //
  if (
    text.includes("engineering") ||
    text.includes("structural") ||
    text.includes("infrastructure") ||
    text.includes("civil") ||
    text.includes("load") ||
    text.includes("foundation")
  ) {
    return "engineering-analysis";
  }

  if (
    text.includes("mechanic") ||
    text.includes("engine") ||
    text.includes("vehicle") ||
    text.includes("pump") ||
    text.includes("motor") ||
    text.includes("hydraulic")
  ) {
    return "mechanics-analysis";
  }

  //
  // NEW V12 Alpha Sector Analysis
  //
  if (
    text.includes("sector") ||
    text.includes("grid") ||
    text.includes("power") ||
    text.includes("water") ||
    text.includes("telecom") ||
    text.includes("infrastructure map")
  ) {
    return "sector-analysis";
  }

  //
  // NEW V12 Alpha Science & Environmental Engines
  //
  if (text.includes("science") || text.includes("chemistry") || text.includes("physics"))
    return "science";

  if (text.includes("geothermal") || text.includes("heat well") || text.includes("thermal"))
    return "geothermal";

  if (text.includes("solar") || text.includes("wind") || text.includes("renewable"))
    return "renewables";

  if (text.includes("building code") || text.includes("code compliance"))
    return "building-code";

  if (text.includes("zoning") || text.includes("land use") || text.includes("parcel"))
    return "zoning";

  //
  // Decision Engine
  //
  if (text.includes("should i") || text.includes("decide") || text.includes("decision"))
    return "decision";

  //
  // Default fallback
  //
  return "unknown";
}
