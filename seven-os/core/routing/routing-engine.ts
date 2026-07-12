// Seven-OS Dynamic Routing Engine
// Self-healing, auto-discovery, autosorter-proof

import fs from "fs";
import path from "path";
import aiIdentity from "../../system/identity/machine-identity.json";
import { WorkerDiscovery } from "./worker-discovery";

export interface RouteManifest {
  id: string;
  type: "engine" | "module" | "worker" | "plugin";
  sector?: string;
  routes?: string[];
  cli?: string[];
  workers?: string[];
}

export class RoutingEngine {
  private static manifests: Map<string, RouteManifest> = new Map();
  private static cliRoutes: Set<string> = new Set();
  private static workerRoutes: Set<string> = new Set();
  private static engineRoutes: Set<string> = new Set();

  static identity = aiIdentity;

  static scan(baseDir: string) {
    // Sovereign guard: prevent node_modules drift inside Seven-OS
    if (RoutingEngine.identity.forbidLocalNodeModules) {
      const localNM = path.join(baseDir, "node_modules");
      if (fs.existsSync(localNM)) {
        throw new Error("Forbidden: node_modules detected inside Seven-OS");
      }
    }

    const entries = fs.readdirSync(baseDir, { withFileTypes: true });

    for (const entry of entries) {
      const full = path.join(baseDir, entry.name);

      if (entry.isDirectory()) {
        this.scan(full);
      }

      if (entry.isFile() && entry.name === "manifest.json") {
        const manifest: RouteManifest = JSON.parse(fs.readFileSync(full, "utf8"));
        this.registerManifest(manifest);
      }
    }
  }

  static registerManifest(manifest: RouteManifest) {
    this.manifests.set(manifest.id, manifest);

    manifest.cli?.forEach(cmd => this.cliRoutes.add(cmd));
    manifest.routes?.forEach(route => this.engineRoutes.add(route));
    manifest.workers?.forEach(worker => this.workerRoutes.add(worker));
  }

  static getCLIRoutes() {
    return [...this.cliRoutes];
  }

  static getEngineRoutes() {
    return [...this.engineRoutes];
  }

  static getWorkerRoutes() {
    return [...this.workerRoutes];
  }

  static getManifest(id: string) {
    return this.manifests.get(id) || null;
  }

  static listWorkers() {
    return WorkerDiscovery.listWorkers();
  }

}
