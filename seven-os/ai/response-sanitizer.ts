// autonomous/seven-os/ai/response-sanitizer.ts
// GIA Sovereign AI Response Sanitizer – V12 Alpha (TypeScript Version)

import {
  getPlatformContext,
  getNodeContext,
  getClusterContext,
  getAIContext,
  sha256
} from "../utils/context.js";

// ---- Types ----

export interface SanitizedOutput {
  ok: boolean;
  timestamp: string;
  output: any;
  platform: any;
  nodes: any;
  clusters: any;
  ai: any;
  context: {
    workflow: string | null;
    trustZone: string;
    inputHash: string | null;
    contextHash: string | null;
  };
  integrity?: {
    hash: string;
    verified: boolean;
  };
}

export interface EnvContext {
  [key: string]: any;
}

export interface AIContext {
  workflow?: string | null;
  trustZone?: string;
  inputHash?: string | null;
  contextHash?: string | null;
  [key: string]: any;
}

// ---- Main Sanitizer ----

export async function sanitizeOutput(
  output: any = {},
  env: EnvContext = {},
  context: AIContext = {}
): Promise<SanitizedOutput> {
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
  const final: SanitizedOutput = {
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

// ---- Internal Helpers ----

function normalize(output: any): any {
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

function enforceSchema(out: any): any {
  return {
    type: out.type || "text",
    content: out.content || "",
    items: out.items || null,
    meta: out.meta || {}
  };
}

function stripUnsafe(out: any): any {
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
