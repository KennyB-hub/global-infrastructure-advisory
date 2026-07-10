// GIA Sovereign Gateway Worker – V12 Alpha (TypeScript)
// Routes: Hubs, Contractors, Deep Mind, System Endpoints, Decision Engine

import { runDecision } from "../../ai/decision-engine";
import { systemStatus } from "../system/system-endpoints";
import { diagnostics } from "../../system/diagnostics";
import { uptime } from "../..backend/system/uptime";
import { fullReport } from "../../src/system/full-report";
import { systemThreatReport } from "../../src/system/threat-report";
import { runCloudflareDiagnostics } from "../../src/system/cloudflare-tests";

import systemManifest from "../../src/config/system-manifest.json";
import nodeRegistry from "../../src/system/config/node-registry.json";

let START_TIME = Date.now();

// ---------------------------------------------------------
// Utility: Unified JSON Response
// ---------------------------------------------------------
function json(
  data: Record<string, any>,
  status: number = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "GIA-Platform-ID": systemManifest.platform_id,
      "GIA-Version": systemManifest.version,
      ...extraHeaders
    }
  });
}
