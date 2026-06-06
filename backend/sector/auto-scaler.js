// Sector Engine Auto‑Scaling – V12 Sovereign Edition

export class SectorAutoScaler {
  constructor(env, nodeRegistry) {
    this.env = env;
    this.registry = nodeRegistry;
  }

  evaluateLoad(sectorMetrics) {
    const { load, latency, failures } = sectorMetrics;

    if (load > 0.85 || latency > 2000 || failures > 5) {
      return "scale_up";
    }

    if (load < 0.25 && latency < 800) {
      return "scale_down";
    }

    return "stable";
  }

  getClusterForSector(sector) {
    return this.registry.clusters.find(c => c.sector === sector) || null;
  }

  async scale(sector, metrics) {
    const decision = this.evaluateLoad(metrics);
    const cluster = this.getClusterForSector(sector);

    return {
      ok: true,
      sector,
      decision,
      cluster: cluster?.name || "none",
      metrics,
      timestamp: new Date().toISOString()
    };
  }
}
