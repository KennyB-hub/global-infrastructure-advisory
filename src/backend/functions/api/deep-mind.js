// 2050 V12 Alpha — Deep Mind Bridge
// Global Infrastructure Platform — AI Core Gateway

import { buildSovereignMetadata } from "../system/metadata.js";
import { computeIntegrityHash } from "../system/integrity.js";
import { applyPolicy } from "../system/policy-engine.js";
import { applyCodeFilter } from "../system/code-filter.js";
import { buildAIContext } from "../system/ai-context.js";

export async function onRequestPost(context) {
  const request = context.request;
  const env = context.env;
  const path = "/api/deep-mind";

  // ---------------------------------------------------------
  // 1. Sovereign Metadata
  // ---------------------------------------------------------
  const sovereign = buildSovereignMetadata({
    api: "deep-mind",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    path,
    method: "POST"
  });

  // ---------------------------------------------------------
  // 2. Policy Engine Enforcement
  // ---------------------------------------------------------
  const policy = applyPolicy({
    request,
    path,
    zone: "internal" // Deep Mind is internal trust-zone only
  });

  if (!policy.allowed) {
    return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);
  }

  // ---------------------------------------------------------
  // 3. Code Filter / Sandbox Guard
  // ---------------------------------------------------------
  const filter = applyCodeFilter(request);
  if (!filter.safe) {
    return sovereignError("CODE_FILTER_BLOCKED", filter.reason, sovereign);
  }

  // ---------------------------------------------------------
  // 4. Parse Request Body
  // ---------------------------------------------------------
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return sovereignError("INVALID_JSON", "Malformed JSON body", sovereign);
  }

  const query = body.query;
  if (!query) {
    return sovereignError("MISSING_QUERY", "Field 'query' is required", sovereign);
  }

  // ---------------------------------------------------------
  // 5. AI Context (for routing, telemetry, inspector)
  // ---------------------------------------------------------
  const ai = buildAIContext({
    request,
    path,
    workflow: "deep-mind",
    trustZone: "internal"
  });

  // ---------------------------------------------------------
  // 6. Execute Deep Mind AI Model
  // ---------------------------------------------------------
  let aiResponse;
  try {
    aiResponse = await env.AI.run("@cf/google/gemma-4-26b-a4b-it", {
      prompt: `GIA Deep Mind 2100 — System Intelligence Query:\n${query}`,
      max_tokens: 512
    });
  } catch (err) {
    return sovereignError("AI_ENGINE_FAILURE", err.message, sovereign);
  }

  const payload = {
    result: aiResponse.response,
    timestamp: Date.now()
  };

  // ---------------------------------------------------------
  // 7. Sovereign Success Response
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
function sovereignError(code, message, sovereign) {
  const body = {
    ok: false,
    error: { code, message },
    sovereign,
    integrity: computeIntegrityHash({ code, message })
  };

  return new Response(JSON.stringify(body), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  });
}

