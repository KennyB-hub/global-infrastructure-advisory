// src/functions/api/gov/sectors.js
import { requireRole } from "../../../system/trust/api-trust.js";
import { buildSovereignMetadata } from "../../../system/metadata.js";
import { computeIntegrityHash } from "../../../system/integrity.js";
import { applyPolicy } from "../../../system/policy-engine.js";
import { buildAIContext } from "../../../system/ai-context.js";
import { buildGovSectorView } from "../../../system/engines/gov-engine.js";
import { KeyEngine } from "../../system/security/key-engine.js";
import { dbQuery } from "../../system/db/db-access.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const path = "/api/gov/sectors";
  const keyEngine = new KeyEngine(env);

  const sovereign = buildSovereignMetadata({
    api: "gov-sectors",
    path,
    method: "GET",
    node: env.NODE_ID,
    cluster: env.CLUSTER_ID
  });

  const trust = requireRole("gov", request, env);
  if (!trust.allowed) return trust.response;

  const policy = applyPolicy({ request, path, zone: "gov" });
  if (!policy.allowed) return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);

  const ai = buildAIContext({ request, path, workflow: "gov-sectors", trustZone: "gov" });

  const { results: sectors } = await env.DB.prepare("SELECT * FROM sectors").all();
  const { results: opportunities } = await env.DB.prepare("SELECT * FROM opportunities").all();
  const { results: workforce } = await env.DB.prepare("SELECT * FROM contractors").all();

  const view = buildGovSectorView({ sectors, opportunities, workforce });

  const payload = { view, timestamp: Date.now() };

  return new Response(JSON.stringify({
    ok: true,
    payload,
    sovereign,
    ai,
    integrity: computeIntegrityHash(payload)
  }), { status: 200, headers: { "Content-Type": "application/json" } });
}

function sovereignError(code, message, sovereign, status = 400) {
  return new Response(JSON.stringify({
    ok: false,
    error: { code, message },
    sovereign,
    integrity: computeIntegrityHash({ code, message })
  }), { status, headers: { "Content-Type": "application/json" } });
}
