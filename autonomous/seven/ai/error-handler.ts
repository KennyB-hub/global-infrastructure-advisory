// autonomous/seven-os/ai/error-handler.ts
// GIA Sovereign AI Error Engine – V12 Alpha (TypeScript Version)

import {
  getPlatformContext,
  getNodeContext,
  getClusterContext,
  getAIContext,
  sha256
} from "../utils/context.js";

// ---- Types ----

export interface ErrorExtra {
  [key: string]: any;
}

export interface EnvContext {
  DEBUG?: boolean;
  [key: string]: any;
}

export interface ErrorPayload {
  ok: false;
  status: "error";
  timestamp: string;

  error: string;
  type: string;
  stack?: string;

  extra: ErrorExtra;

  platform: any;
  nodes: any;
  clusters: any;
  ai: any;

  integrity?: {
    hash: string;
    verified: boolean;
  };
}

// ---- Main Error Handler ----

export async function handleError(
  err: any,
  env: EnvContext = {},
  extra: ErrorExtra = {}
): Promise<ErrorPayload> {
  const payload: ErrorPayload = {
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
