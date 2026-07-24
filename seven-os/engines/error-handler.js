// /ai-engine/error-handler.js
// GIA Sovereign AI Error Engine – V12 Alpha

import {
  getPlatformContext,
  getNodeContext,
  getClusterContext,
  getAIContext,
  sha256
} from "../backend/utils/context.js";

export async function handleError(err, env, extra = {}) {
  const payload = {
    ok: false,
    status: "error",
    timestamp: new Date().toISOString(),

    error: err?.message || "Unknown backend AI error",
    type: err?.name || "AIError",
    stack: env?.DEBUG ? err?.stack : undefined,

    extra,

    platform: getPlatformContext(),
    nodes: getNodeContext(),
    clusters: getClusterContext(),
    ai: getAIContext(env)
  };

  payload.integrity = {
    hash: await sha256(JSON.stringify(payload)),
    verified: true
  };

  return payload;
}
