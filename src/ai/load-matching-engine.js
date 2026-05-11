// load-matching-engine.js
// V12 Alpha – Load Matching Engine
import { createLoad, listLoads, updateLoadStatus } from "../ai/load-registry.js";
import { matchHaulersForLoad } from "../ai/load-matching-engine.js";

const { listHaulers } = require("./hauler-registry");
const { getLoadById } = require("./load-registry");

/**
 * Simple distance proxy: region equality or adjacency list later.
 */
function regionCompatible(loadOrigin, haulerRegion) {
  if (!loadOrigin || !haulerRegion) return false;
  if (loadOrigin === haulerRegion) return true;

  // later: add adjacency map (WV ↔ OH, PA, KY, VA, etc.)
  return false;
}

/**
 * Basic capacity check.
 */
function capacityCompatible(headCount, haulerCapacity) {
  if (!haulerCapacity || !headCount) return false;
  return haulerCapacity >= headCount;
}

/**
 * Score a hauler for a given load.
 */
function scoreHaulerForLoad(load, hauler) {
  let score = 0;

  if (regionCompatible(load.origin, hauler.region)) score += 30;
  if (capacityCompatible(load.headCount, hauler.capacity)) score += 30;
  if (hauler.verified) score += 20;

  // lower riskScore = better
  const risk = typeof hauler.riskScore === "number" ? hauler.riskScore : 50;
  score += Math.max(0, 20 - Math.min(risk, 20)); // 0–20 bonus

  return score;
}

/**
 * Find best haulers for a given loadId.
 */
function matchHaulersForLoad(loadId, maxResults = 5) {
  const load = getLoadById(loadId);
  if (!load) throw new Error("Load not found");

  const haulers = listHaulers();

  const scored = haulers
    .map((h) => ({
      hauler: h,
      score: scoreHaulerForLoad(load, h)
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return {
    load,
    matches: scored
  };
}

module.exports = {
  matchHaulersForLoad
};
