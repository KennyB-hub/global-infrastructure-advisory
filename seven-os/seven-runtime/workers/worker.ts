// GIA Sovereign Gateway Worker – V12 Alpha (TypeScript)
// Routes: Hubs, Contractors, Deep Mind, System Endpoints, Decision Engine

import { runDecision } from "../autonomous/ai/engine/decision-engine";
import { systemStatus } from "../../autonomous/system/system-endpoints";
import { diagnostics } from "../../autonomous/system/diagnostics";
import { uptime } from "../../autonomous/system/uptime";
import { fullReport } from "../../autonomous/system/full-report";
import { systemThreatReport } from "../../autonomous/system/threat-report";
import { runCloudflareDiagnostics } from "../../autonomous/system/cloudflare-tests";

import systemManifest from "../../src/config/system-manifest.json";
import nodeRegistry from "../../src/config/node-registry.json";

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
