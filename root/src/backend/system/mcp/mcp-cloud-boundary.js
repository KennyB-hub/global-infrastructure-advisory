// backend/system/mcp/mcp-cloud-boundary.js

/**
 * MCP Cloud Boundary Enforcement
 * Ensures requests cannot cross cloud-provider boundaries
 * without explicit sovereign policy approval.
 */

export function enforceCloudBoundary({ sourceCloud, targetCloud, trustZone }) {
  // Same cloud → always allowed
  if (sourceCloud === targetCloud) {
    return { allowed: true, reason: "same_cloud" };
  }

  // DeepGov nodes are allowed to cross boundaries
  if (trustZone === "deepgov") {
    return { allowed: true, reason: "deepgov_override" };
  }

  // Public zone cannot cross boundaries
  if (trustZone === "public") {
    return {
      allowed: false,
      reason: "public_zone_cross_cloud_blocked"
    };
  }

  // Default: block unless explicitly whitelisted
  return {
    allowed: false,
    reason: `cross_cloud_blocked_${sourceCloud}_to_${targetCloud}`
  };
}
