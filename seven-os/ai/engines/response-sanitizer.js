// /ai-engine/response-sanitizer.js
// GIA Sovereign AI Response Sanitizer – V12 Alpha

import {
  getPlatformContext,
  getNodeContext,
  getClusterContext,
  getAIContext,
  sha256
} from "../../backend/utils/context.js";

export async function sanitizeOutput(output = {}, env = {}, context = {}) {
  //
  // 1. Normalize output structure
  //
  const normalized = normalize(output);

  //
  // 2. Enforce required fields
  //
  const enforced = enforceSchema(normalized);

  //
  // 3. Remove unsafe fields
  //
  const cleaned = stripUnsafe(enforced);

  //
  // 4. Sovereign metadata
  //
  const final = {
    ok: true,
    timestamp: new Date().toISOString(),

    output: cleaned,

    platform: getPlatformContext(),
    nodes: getNodeContext(),
    clusters: getClusterContext(),
    ai: getAIContext(env),

    context: {
      workflow: context.workflow || null,
      trustZone: context.trustZone || "public",
      inputHash: context.inputHash || null,
      contextHash: context.contextHash || null
    }
  };

  //
  // 5. Integrity hash
  //
  final.integrity = {
    hash: await sha256(JSON.stringify(final)),
    verified: true
  };

  return final;
}

//
// --- INTERNAL HELPERS ------------------------------------------------------
//

function normalize(output) {
  if (typeof output === "string") {
    return { type: "text", content: output };
  }

  if (Array.isArray(output)) {
    return { type: "list", items: output };
  }

  if (typeof output === "object" && output !== null) {
    return output;
  }

  return { type: "unknown", content: String(output) };
}

function enforceSchema(out) {
  return {
    type: out.type || "text",
    content: out.content || "",
    items: out.items || null,
    meta: out.meta || {}
  };
}

function stripUnsafe(out) {
  const safe = { ...out };

  delete safe.debug;
  delete safe.internal;
  delete safe.stack;
  delete safe.raw;
  delete safe.unfiltered;
  delete safe.system;
  delete safe.secrets;

  return safe;
}
