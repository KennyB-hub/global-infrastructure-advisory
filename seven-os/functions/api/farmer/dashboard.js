// seven-os/functions/api/farmer/dashboard.js
import { requireRole } from "../../../system/trust/api-trust.js";
import { buildSovereignMetadata } from "../../../system/metadata.js";
import { computeIntegrityHash } from "../../../system/integrity.js";
import { applyPolicy } from "../../../system/policy-engine.js";
import { buildAIContext } from "../../../system/ai-context.js";
import { buildFarmerView } from "../../../system/engines/farmer-engine.js";
import { KeyEngine } from "../../../system/security/key-engine.js";
import { dbQuery } from "../../../system/db/db-access.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const path = "/api/farmer/dashboard";
  const keyEngine = new KeyEngine(env);

  const sovereign = buildSovereignMetadata({
    api: "farmer-dashboard",
    path,
    method: "GET",
    node: env.NODE_ID,
    cluster: env.CLUSTER_ID
  });

  const trust = requireRole("farmer", request, env); // or "public" for read-only
  if (!trust.allowed) return trust.response;

  const policy = applyPolicy({ request, path, zone: "farmer" });
  if (!policy.allowed) return sovereignError("POLICY_BLOCKED", policy.reason, sovereign);

  const ai = buildAIContext({ request, path, workflow: "farmer-dashboard", trustZone: "farmer" });

  // DB fetches are local to this zone
  const farmer = await env.DB.prepare("SELECT * FROM farmers WHERE id = ?")
    .bind(trust.userId)
    .first();
  const { results: opportunities } = await env.DB.prepare("SELECT * FROM opportunities").all();

  const view = buildFarmerView({ farmer, opportunities });

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
