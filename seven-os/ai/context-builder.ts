// seven-os/ai/context-builder.ts
// GIA Sovereign AI Context Builder – V12 Alpha (TypeScript Version)

import {
  getPlatformContext,
  getNodeContext,
  getClusterContext,
  getAIContext,
  sha256
} from "../utils/context.js";

// ---- Types ----

export interface AIContext {
  timestamp: number;
  iso: string;
  source: string;

  inputSummary: string;
  inputHash: string;

  platform: any;
  nodes: any;
  clusters: any;
  ai: any;

  trustZone: string;
  workflow: string | null;

  routing: {
    colo: string | null;
    country: string | null;
    asn: string | null;
    ip: string | null;
  };

  audit: {
    contextVersion: string;
    integrity: string;
  };

  contextHash?: string;
}

export interface BuildContextInput {
  text?: string;
  trustZone?: string;
  workflow?: string;
  [key: string]: any;
}

export interface BuildContextEnv {
  cf?: {
    colo?: string;
    country?: string;
    asn?: string;
    ip?: string;
  };
  [key: string]: any;
}

// ---- Main Builder ----

export async function buildContext(
  input: BuildContextInput = {},
  env: BuildContextEnv = {}
): Promise<AIContext> {
  const timestamp = Date.now();

  const context: AIContext = {
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

    // Routing metadata (Cloudflare-style)
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

// ---- Helper: summarize input safely ----

function summarizeInput(input: any): string {
  if (!input) return "";
  if (typeof input === "string") return input.slice(0, 80);
  if (input.text) return input.text.slice(0, 80);
  return JSON.stringify(input).slice(0, 80);
}
