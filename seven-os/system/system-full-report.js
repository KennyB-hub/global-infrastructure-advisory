// /workers/system/system-full-report.js
// GIA Sovereign Full System Report – V12 Alpha

import { systemFullReport } from "src/backend/system/system-full-report.js";
import infra from "../../infrastructure/index.js";
import { storageInspector } from "src/backend/infrastructure/tools/storage-inspector.js";
import { inspectRouting } from "src/backend/security/tools/inspect-routing.js";

import systemManifest from "../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../config/node-registry.json" assert { type: "json" };
import clusterHealth from "../../config/cluster-health.json" assert { type: "json" };

// Unified JSON responder
function json(data, status = 200, extraHeaders = {}) {
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

// ---------------------------------------------------------
// SYSTEM: Engineering Report
// ---------------------------------------------------------
if (url.pathname === "/system/engineering-report" && request.method === "POST") {
  try {
    const body = await request.json();

    const input = {
      domain: body.domain,
      system: body.system,
      data: body.data || {},
      trustZone: "system",
      workflow: "engineering-analysis"
    };

    const report = await engineeringEngine.process(input, env, {
      trustZone: "system",
      workflow: "engineering-analysis"
    });

    return json(report);
  } catch (err) {
    return json({ error: "Engineering Engine Failure", details: err.message }, 500);
  }
}

// ---------------------------------------------------------
// SYSTEM: Mechanics Report
// ---------------------------------------------------------
if (url.pathname === "/system/mechanics-report" && request.method === "POST") {
  try {
    const body = await request.json();

    const input = {
      category: body.category,
      system: body.system,
      data: body.data || {},
      trustZone: "system",
      workflow: "mechanics-analysis"
    };

    const report = await mechanicsEngine.process(input, env, {
      trustZone: "system",
      workflow: "mechanics-analysis"
    });

    return json(report);
  } catch (err) {
    return json({ error: "Mechanics Engine Failure", details: err.message }, 500);
  }
}

export async function onRequest(context) {
  const { cf, ai } = context.env;
  const manifest = context.env?.MANIFEST || {};

  //
  // 1. BACKEND SYSTEM REPORT (Deep Mind 2100)
  //
  const backendReport = systemFullReport(manifest, ai);

  //
  // 2. INFRASTRUCTURE + SECURITY REPORTS
  //
  const [infraReport, storage, routing] = await Promise.all([
    infra.diagnostics(cf),
    storageInspector(cf),
    inspectRouting(context.request.url, cf, ai)
  ]);

  //
  // 3. PLATFORM + NODE + CLUSTER METADATA
  //
  const platform = {
    id: systemManifest.platform_id,
    version: systemManifest.version,
    failsafe: systemManifest.failsafe_level,
    active_sectors: systemManifest.active_sectors,
    endpoints: systemManifest.endpoints
  };

  const nodes = nodeRegistry.clusters.map(c => ({
    name: c.name,
    sector: c.sector,
    hostname: c.hostname,
    port: c.port,
    tls: c.tls
  }));

  const clusters = clusterHealth.clusters.map(c => ({
    name: c.name,
    sector: c.sector,
    status: c.status,
    health_score: c.health_score
  }));

  //
  // 4. AI SUBSYSTEM STATUS
  //
  const aiSubsystem = {
    decisionEngine: "/api/decision",
    cortex: "/api/cortex",
    deepMind: "/api/deep-mind",
    status: "ready"
  };

  //
  // 5. FINAL UNIFIED REPORT
  //
  const report = {
    timestamp: new Date().toISOString(),

    platform,
    nodes,
    clusters,

    backend: backendReport,
    infrastructure: infraReport,
    storage,
    routing,

    ai: aiSubsystem,

    notes: "This is the Sovereign Full System Report. All system operations must comply with trust‑zone and platform policy."
  };

  return json({
    system: "full-report",
    status: "ok",
    report
  });
}
