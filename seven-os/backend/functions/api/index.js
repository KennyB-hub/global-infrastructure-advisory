// 2050 V12 Alpha — Sovereign API Gateway
// Global Infrastructure Platform — System Layer Entry

import { handleEwoDispatch } from "./ewo.js";
import { handleSectorStatus } from "./sector-status.js";
import { handleGlobalMap, handleSectorMap } from "./map/map.js";
import { handleAuthLogin } from "../../../functions/api/auth-login.js";
import { handleAuthCallback } from "../../../functions/api/auth-callback.js";
import { openIncidentsFromAlerts } from "../../../ai/incident-response-workflow.js";

// --- V12 Alpha Utility Imports ---
import { buildSovereignMetadata } from "../../../system/metadata.js";
import { verifyTrustZone } from "../../../system/trust-middleware.js";
import { applyPolicy } from "../../../system/policy-engine.js";
import { applyCodeFilter } from "../../../ai/filters/code-filter.js";
import { computeIntegrityHash } from "../../../system/integrity.js";
import { buildAIContext } from "../../../system/ai-context.js";
import { verifyDidVcIdentity } from "../../system/identity/did-vc-verifier.js";

import { runDecisionEngine } from "../../../engines/decision-engine.js";
import { Cortex } from "../../ai/cortex.js";
import nodeRegistry from "../../config/node-registry.json" assert { type: "json" };

import { enforceMCP } from "../../backend/system/mcp/enforcer.js";
import { handleCyberApi } from "../../../system/api/cyber.js";
import { handleGovViewApi } from "../../../system/api/gov-view.js";
import { handleOpportunityApi } from "../../../system/api/opportunity.js";
import { handleMarketplaceApi } from "../../../system/api/marketplace.js";
import { handleSectorMatchApi } from "../../../system/api/sector-match.js";

export async function handleApiRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  // ---------------------------------------------------------
  // 0. DID / VC Identity
  // ---------------------------------------------------------
  const identity = await verifyDidVcIdentity(request, env);

  // ---------------------------------------------------------
  // 1. Sovereign Metadata (required for every V12 Alpha API)
  // ---------------------------------------------------------
  const sovereign = buildSovereignMetadata({
    api: "api-gateway",
    version: "2050.V12A",
    node: env.NODE_ID,
    cluster: env.CLUSTER_ID,
    path,
    method: request.method,
    subject: identity.subject || "anonymous"
  });

  // ---------------------------------------------------------
  // 2. Trust‑Zone Enforcement
  // ---------------------------------------------------------
  const trust = verifyTrustZone({
    request,
    path,
    zone: identity.trustZone || "public" // identity-aware trust zone
  });

  if (!trust.allowed) {
    return sovereignError("TRUST_DENIED", "Access denied by trust‑zone policy", sovereign);
  }

  // ---------------------------------------------------------
  // 3. Policy Engine Enforcement
  // ---------------------------------------------------------
  const policyResult = applyPolicy({ request, path, identity });
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
    trustZone: trust.zone,
    identity
  });

  // ---------------------------------------------------------
  // 6. MCP Enforcement (Gateway-level)
  // ---------------------------------------------------------
  const mcp = await enforceMCP({
    trustZone: trust.zone,
    method: request.method,
    path,
    identity,
    threat: { level: "none" } // gateway is low-risk; deep threat handled downstream
  });

  if (!mcp.allowed) {
    return sovereignError("MCP_DENIED", mcp.reason || "Blocked by MCP policy", sovereign);
  }

  // ---------------------------------------------------------
  // 7. Route Table (V12 Alpha — Expanded)
  // ---------------------------------------------------------
  try {
    // Global Map
    if (path === "/api/map/global") {
      return sovereignWrap(await handleGlobalMap(request), sovereign, ai);
    }

    // Incident Scan (Dashboard Button)
    if (path === "/api/security/incidents/scan" && request.method === "POST") {
      const incidents = openIncidentsFromAlerts();
      return sovereignWrap({ created: incidents.length, incidents }, sovereign, ai);
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

    // -----------------------------------------------------
    // NEW: Cyber API
    // -----------------------------------------------------
    if (path.startsWith("/api/cyber")) {
      const res = await handleCyberApi(request, env);
      const payload = await res.json();
      return sovereignWrap(payload, sovereign, ai);
    }

    // -----------------------------------------------------
    // NEW: Gov View API
    // -----------------------------------------------------
    if (path.startsWith("/api/gov/view")) {
      const res = await handleGovViewApi(request, env);
      const payload = await res.json();
      return sovereignWrap(payload, sovereign, ai);
    }

    // -----------------------------------------------------
    // NEW: Opportunity Scanner API
    // -----------------------------------------------------
    if (path.startsWith("/api/opportunities")) {
      const res = await handleOpportunityApi(request, env);
      const payload = await res.json();
      return sovereignWrap(payload, sovereign, ai);
    }

    // -----------------------------------------------------
    // NEW: Unified Marketplace API
    // -----------------------------------------------------
    if (path.startsWith("/api/marketplace")) {
      const res = await handleMarketplaceApi(request, env);
      const payload = await res.json();
      return sovereignWrap(payload, sovereign, ai);
    }

    // -----------------------------------------------------
    // NEW: Sector-Aware Matching API
    // -----------------------------------------------------
    if (path.startsWith("/api/sector/match")) {
      const res = await handleSectorMatchApi(request, env);
      const payload = await res.json();
      return sovereignWrap(payload, sovereign, ai);
    }

    // -----------------------------------------------------
    // NEW: Decision Engine API
    // -----------------------------------------------------
    if (path === "/api/decision" && request.method === "POST") {
      const body = await request.json();
      const result = await runDecisionEngine({ ...body, nodeRegistry, env, identity, mcp });
      return sovereignWrap(result, sovereign, ai);
    }

    // -----------------------------------------------------
    // NEW: Cortex API
    // -----------------------------------------------------
    if (path === "/api/cortex" && request.method === "POST") {
      const body = await request.json();
      const cortex = new Cortex(env);
      const result = await cortex.process({ ...body, identity, mcp });
      return sovereignWrap(result, sovereign, ai);
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
