// Sector Engine – V12 Sovereign Edition

import { SectorAutoScaler } from "./auto-scaler.js";

export class SectorEngine {
  constructor(env, nodeRegistry) {
    this.env = env;
    this.registry = nodeRegistry;
    this.scaler = new SectorAutoScaler(env, nodeRegistry);
  }

  async evaluate(sector, metrics) {
    return await this.scaler.scale(sector, metrics);
  }
}
