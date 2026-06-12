// /functions/api/opportunities.js
// 2050 V12 Alpha — Opportunities Listing

import { buildSovereignMetadata } from "../../system/metadata.js";
import { computeIntegrityHash } from "../../system/integrity.js";
import { applyPolicy } from "../../system/policy-engine.js";
import { buildAIContext } from "../../system/ai-context.js";
import { requireRole } from "../../system/trust/api-trust.js";

export async function onRequestGet(context) {
  const request = context.request;
  const env = context.env;
  const path = "/api/opportunities";

  const sovereign = buildSovereignMetadata({
    api: "opportunities-list",
    version: "2050.V12A",
    node: env?.NODE_ID,
    cluster: env?.CLUSTER_ID,
    path,
    method: "GET"
  });

  const trust = requireRole("public", request, env);
  if (!trust.allowed) return trust.response;

  const policy = applyPolicy({ request, path, zone: "public" });
  if (!policy.allowed) return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);

  const ai = buildAIContext({
    request,
    path,
    workflow: "opportunities-list",
    trustZone: "public"
  });

  const opportunities = [
    { 
      id: 1, 
      title: "Grid Modernization Project", 
      program: "Energy Transition", 
      region: "Sub-Saharan Africa", 
      sector: "Energy",
      type: "Infrastructure",
      deadline: "2024-12-31",
      description: "Implementing smart grid tech for regional stability."
    },
    { 
      id: 2, 
      title: "Urban Water Expansion", 
      program: "WASH Initiative", 
      region: "Southeast Asia", 
      sector: "Water",
      type: "Construction",
      deadline: "2024-10-15",
      description: "Upgrading treatment plants and distribution networks."
    }
  ];

  const payload = {
    opportunities,
    count: opportunities.length,
    timestamp: Date.now()
  };

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
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}

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
