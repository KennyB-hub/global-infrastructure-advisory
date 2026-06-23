import { getSectorById } from "../../system/sectors/sector-loader.js";
import { requireRole } from "../../system/trust/api-trust.js";

// 2050 V12 Alpha — Sector Status Handler
// Global Infrastructure Platform — Government Intelligence Layer

import { requireRole } from "../../system/trust/api-trust.js";
import { getSectorById } from "../../system/sector/sector-loader.js";
import { buildSovereignMetadata } from "../../system/metadata.js";
import { computeIntegrityHash } from "../../system/integrity.js";
import { applyPolicy } from "../../system/policy-engine.js";
import { buildAIContext } from "../../system/ai-context.js";

export async function handleSectorStatus(request, env) {
  const path = new URL(request.url).pathname;

  // ---------------------------------------------------------
  // 1. Sovereign Metadata
  // ---------------------------------------------------------
  const sovereign = buildSovereignMetadata({
    api: "sector-status",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    path,
    method: "GET"
  });

  // ---------------------------------------------------------
  // 2. Trust‑Zone Enforcement (gov-level)
  // ---------------------------------------------------------
  const trust = requireRole("gov", request, env);
  if (!trust.allowed) return trust.response;

  // ---------------------------------------------------------
  // 3. Policy Engine Enforcement
  // ---------------------------------------------------------
  const policy = applyPolicy({
    request,
    path,
    zone: "gov"
  });

  if (!policy.allowed) {
    return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);
  }

  // ---------------------------------------------------------
  // 4. Extract Sector ID
  // ---------------------------------------------------------
  const parts = path.split("/");
  const sectorId = parts[3];

  if (!sectorId) {
    return sovereignError("MISSING_SECTOR_ID", "Sector ID is required", sovereign);
  }

  // ---------------------------------------------------------
  // 5. Validate Sector
  // ---------------------------------------------------------
  const sector = getSectorById(sectorId);
  if (!sector) {
    return sovereignError("UNKNOWN_SECTOR", `Sector '${sectorId}' not found`, sovereign, 404);
  }

  // ---------------------------------------------------------
  // 6. AI Context
  // ---------------------------------------------------------
  const ai = buildAIContext({
    request,
    path,
    workflow: "sector-status",
    trustZone: "gov"
  });

  // ---------------------------------------------------------
  // 7. Build Payload
  // ---------------------------------------------------------
  const payload = {
    sector: sectorId,
    status: "operational",
    timestamp: Date.now()
  };

  // ---------------------------------------------------------
  // 8. Sovereign Success Response
  // ---------------------------------------------------------
  return new Response(
    JSON.stringify({
      ok: true,
      payload,
      sovereign,
      ai,
      integrity: computeIntegrityHash(payload)
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}

// ---------------------------------------------------------
// V12 Alpha — Unified Error Model
// ---------------------------------------------------------
function sovereignError(code, message, sovereign, status = 400) {
  const body = {
    ok: false,
    error: { code, message },
    sovereign,
    integrity: computeIntegrityHash({ code, message })
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
