// src/backend/threat/threat-fetch.js
// GIA Sovereign Threat Fetch Engine – V12 Alpha

import systemManifest from "../../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../../config/node-registry.json" assert { type: "json" };
import clusterHealth from "../../config/cluster-health.json" assert { type: "json" };

import { CyberThreatModels } from "./cyber-models.js";
import { TrustZoneEngine } from "../trust/engine.js";
import { RoutingEngine } from "../network/routing-engine.js";
import { CloudPolicies } from "../policy/cloud-policies.js";
import { ThreatTelemetry } from "./threat-telemetry.js";

export async function fetchThreatEvents(env) {
  const list = await env.GIA_THREATS.list({ prefix: "threat:" });
  const events = [];

  for (const item of list.keys) {
    const raw = await env.GIA_THREATS.get(item.name);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);

      // 1. Sovereign metadata
      const enriched = {
        ...parsed,
        fetchedAt: Date.now(),
        platform: {
          id: systemManifest.platform_id,
          version: systemManifest.version
        },
        nodes: nodeRegistry.clusters.map(c => ({
          name: c.name,
          sector: c.sector
        })),
        clusters: clusterHealth.clusters.map(c => ({
          name: c.name,
          status: c.status,
          health_score: c.health_score
        }))
      };

      // 2. Cyber threat scoring
      enriched.cyber = CyberThreatModels.assess({
        sector: { name: enriched.sector, context: enriched }
      });

      // 3. Trust‑Zone classification
      enriched.trust = TrustZoneEngine.classify({
        sector: { name: enriched.sector, context: enriched },
        environment: enriched.environment || {},
        location: enriched.location || {}
      });

      // 4. Routing intelligence (if applicable)
      enriched.routing = RoutingEngine.evaluate({
        sector: { name: enriched.sector, context: enriched }
      });

      // 5. Cloud policy enrichment (if applicable)
      enriched.cloudPolicy = CloudPolicies.apply(
        { sector: { name: enriched.sector, context: enriched } },
        { warnings: [] }
      );

      // 6. Telemetry (offline-safe)
      ThreatTelemetry.push(enriched);

      events.push(enriched);
    } catch {
      continue;
    }
  }

  // 7. Sort newest → oldest
  events.sort((a, b) => b.timestamp - a.timestamp);

  return events;
}
