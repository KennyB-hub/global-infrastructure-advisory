// 2050 V12 Alpha — Sovereign API Gateway
// Global Infrastructure Platform — System Layer Entry

import { handleEwoDispatch } from "./ewo.js";
import { handleSectorStatus } from "./sector-status.js";
import { handleGlobalMap, handleSectorMap } from "./map.js";
import { handleAuthLogin } from "./auth-login.js";
import { handleAuthCallback } from "./auth-callback.js";

// --- V12 Alpha Utility Imports (you already have these in your system layer) ---
import { buildSovereignMetadata } from "../system/metadata.js";
import { verifyTrustZone } from "../system/trust.js";
import { applyPolicy } from "../system/policy-engine.js";
import { applyCodeFilter } from "../system/code-filter.js";
import { computeIntegrityHash } from "../system/integrity.js";
import { buildAIContext } from "../system/ai-context.js";

export async function handleApiRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  // ---------------------------------------------------------
  // 1. Sovereign Metadata (required for every V12 Alpha API)
  // ---------------------------------------------------------
  const sovereign = buildSovereignMetadata({
    api: "api-gateway",
    version: "2050.V12A",
    node: env.NODE_ID,
    cluster: env.CLUSTER_ID,
    path,
    method: request.method
  });

  // ---------------------------------------------------------
  // 2. Trust‑Zone Enforcement
  // ---------------------------------------------------------
  const trust = verifyTrustZone({
    request,
    path,
    zone: "public", // Gateway is public-facing; workers enforce deeper zones
  });

  if (!trust.allowed) {
    return sovereignError("TRUST_DENIED", "Access denied by trust‑zone policy", sovereign);
  }

  // ---------------------------------------------------------
  // 3. Policy Engine Enforcement
  // ---------------------------------------------------------
  const policyResult = applyPolicy({ request, path });
  if (!policyResult.allowed) {
    return sovereignError("POLICY_BLOCKED", policyResult.reason, sovereign);
  }

  // ---------------------------------------------------------
  // 4. Code Filter / Sandbox Guard
  // ---------------------------------------------------------
  const filter = applyCodeFilter(request);
  if (!filter.safe) {
    return sovereignError("CODE_FILTER_BLOCKED", filter.reason, sovereign);
  }

  // ---------------------------------------------------------
  // 5. AI Context Injection (for all AI‑aware endpoints)
  // ---------------------------------------------------------
  const ai = buildAIContext({
    request,
    path,
    workflow: "api-gateway",
    trustZone: trust.zone
  });

  // ---------------------------------------------------------
  // 6. Route Table (V12 Alpha)
  // ---------------------------------------------------------
  try {
    // Global Map
    if (path === "/api/map/global") {
      return sovereignWrap(await handleGlobalMap(request), sovereign, ai);
    }

    // Auth Login
    if (path === "/api/auth/login") {
      return sovereignWrap(await handleAuthLogin(request), sovereign, ai);
    }

    // Auth Callback
    if (path === "/api/auth/callback") {
      return sovereignWrap(await handleAuthCallback(request), sovereign, ai);
    }

    // EWO Dispatch
    if (path === "/api/ewo/dispatch" && request.method === "POST") {
      return sovereignWrap(await handleEwoDispatch(request), sovereign, ai);
    }

    // Sector Status
    if (path.startsWith("/api/sector/") && path.endsWith("/status")) {
      return sovereignWrap(await handleSectorStatus(request), sovereign, ai);
    }

    // Sector Map
    if (path.startsWith("/api/map/sector/")) {
      return sovereignWrap(await handleSectorMap(request), sovereign, ai);
    }

    // Not Found
    return sovereignError("NOT_FOUND", "API route not found", sovereign);

  } catch (err) {
    return sovereignError("UNCAUGHT_EXCEPTION", err.message, sovereign);
  }
}

// ---------------------------------------------------------
// V12 Alpha — Unified Success Wrapper
// ---------------------------------------------------------
function sovereignWrap(payload, sovereign, ai) {
  return new Response(
    JSON.stringify({
      ok: true,
      payload,
      sovereign,
      ai,
      integrity: computeIntegrityHash(payload)
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

// ---------------------------------------------------------
// V12 Alpha — Unified Error Model
// ---------------------------------------------------------
function sovereignError(code, message, sovereign) {
  return new Response(
    JSON.stringify({
      ok: false,
      error: { code, message },
      sovereign,
      integrity: computeIntegrityHash({ code, message })
    }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}
