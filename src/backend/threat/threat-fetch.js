// src/backend/threat/threat-fetch.js
// GIA Sovereign Threat Fetch Engine – V12 Alpha

import systemManifest from "../../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../../config/node-registry.json" assert { type: "json" };
import clusterHealth from "../../config/cluster-health.json" assert { type: "json" };

export async function fetchThreatEvents(env) {
  const list = await env.GIA_THREATS.list({ prefix: "threat:" });

  const events = [];

  for (const item of list.keys) {
    const raw = await env.GIA_THREATS.get(item.name);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);

      events.push({
        ...parsed,

        // Sovereign metadata injected at fetch time
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
      });
    } catch {
      continue;
    }
  }

  // Sort newest → oldest
  events.sort((a, b) => b.timestamp - a.timestamp);

  return events;
}
