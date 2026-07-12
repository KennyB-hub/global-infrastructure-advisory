import fs from "fs";
import path from "path";
import { RoutingEngine } from "./routing-engine";

export interface WorkerInfo {
  id: string;
  file: string;
  sector?: string;
  capabilities?: string[];
  routes?: string[];
}

export class WorkerDiscovery {
  static workers: Map<string, WorkerInfo> = new Map();

  static scan(baseDir: string) {
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });

    for (const entry of entries) {
      const full = path.join(baseDir, entry.name);

      if (entry.isDirectory()) {
        this.scan(full);
      }

      if (entry.isFile() && entry.name === "worker.json") {
        const worker: WorkerInfo = JSON.parse(fs.readFileSync(full, "utf8"));
        this.registerWorker(worker);
      }
    }
  }

  static registerWorker(worker: WorkerInfo) {
    this.workers.set(worker.id, worker);

    // Register worker routes into routing engine
    worker.routes?.forEach(route => RoutingEngine.getWorkerRoutes().push(route));
  }

  static listWorkers() {
    return [...this.workers.values()];
  }

  static getWorker(id: string) {
    return this.workers.get(id) || null;
  }
}
