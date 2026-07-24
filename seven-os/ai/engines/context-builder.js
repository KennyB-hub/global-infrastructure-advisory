// /ai-engine/context-builder.js
// GIA Sovereign AI Context Builder – V12 Alpha

import {
  getPlatformContext,
  getNodeContext,
  getClusterContext,
  getAIContext,
  sha256
} from "../../../backend/utils/context.js";

export async function buildContext(input = {}, env = {}) {
  const timestamp = Date.now();

  const context = {
    timestamp,
    iso: new Date(timestamp).toISOString(),
    source: "backend-ai-engine",

    // Input summary + integrity
    inputSummary: summarizeInput(input),
    inputHash: await sha256(JSON.stringify(input)),

    // Sovereign metadata
    platform: getPlatformContext(),
    nodes: getNodeContext(),
    clusters: getClusterContext(),
    ai: getAIContext(env),

    // Trust zone + workflow metadata
    trustZone: input.trustZone || "public",
    workflow: input.workflow || null,

    // Routing metadata (if available)
    routing: {
      colo: env?.cf?.colo || null,
      country: env?.cf?.country || null,
      asn: env?.cf?.asn || null,
      ip: env?.cf?.ip || null
    },

    // Audit metadata
    audit: {
      contextVersion: "v12-alpha",
      integrity: "verified"
    }
  };

  // Final integrity hash of the entire context
  context.contextHash = await sha256(JSON.stringify(context));

  return context;
}

// Helper: summarize input safely
function summarizeInput(input) {
  if (!input) return "";
  if (typeof input === "string") return input.slice(0, 80);
  if (input.text) return input.text.slice(0, 80);
  return JSON.stringify(input).slice(0, 80);
}
