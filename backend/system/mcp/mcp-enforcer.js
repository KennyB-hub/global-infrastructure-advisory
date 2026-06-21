// backend/system/mcp/mcp-enforcer.js
import { evaluateMCP } from "./mcp-evaluator.js";
import { enforceCloudBoundary } from "./mcp-cloud-boundary.js";

/**
 * enforceMCP()
 * Unified MCP enforcement pipeline:
 * 1. Cloud Boundary
 * 2. Base MCP Policy
 * 3. Return final allow/deny
 */

export async function enforceMCP({ trustZone, method, threat, sourceCloud, targetCloud }) {
  const policyName = trustZone === "deepgov" ? "deepgov" : "default";

  // ---------------------------------------------------------
  // 1. CLOUD BOUNDARY ENFORCEMENT (always first)
  // ---------------------------------------------------------
  const boundary = enforceCloudBoundary({
    sourceCloud,
    targetCloud,
    trustZone
  });

  if (!boundary.allowed) {
    return {
      allowed: false,
      reason: boundary.reason,
      policy: policyName
    };
  }

  // ---------------------------------------------------------
  // 2. BASE MCP POLICY (method, trust zone, threat)
  // ---------------------------------------------------------
  const base = evaluateMCP({
    policyName,
    trustZone,
    method,
    threatLevel: threat.level
  });

  if (!base.allowed) {
    return {
      allowed: false,
      reason: base.reason,
      policy: policyName
    };
  }

  // ---------------------------------------------------------
  // 3. FINAL RESULT
  // ---------------------------------------------------------
  return {
    allowed: true,
    policy: policyName
  };
}
