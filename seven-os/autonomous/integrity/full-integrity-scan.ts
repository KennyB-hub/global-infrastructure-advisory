// Full Integrity Scan Module

import fs from "fs";
import path from "path";
import { queueTask } from "../../autonomous/task-queue";

export class FullIntegrityScan {
  static runAll() {
    const results = {
      backend: this.checkBackendStructure(),
      schemas: this.checkSchemas(),
      config: this.checkConfigFiles()
    };

    queueTask({
      type: "integrity-scan-report",
      payload: results,
      status: "pending"
    });

    return results;
  }

  private static checkBackendStructure() {
    const backendPath = path.resolve("backend");
    const required = ["ai", "security", "services", "workers", "admin", "data"];
    const missing: string[] = [];

    for (const dir of required) {
      if (!fs.existsSync(path.join(backendPath, dir))) {
        missing.push(dir);
      }
    }

    if (missing.length) {
      queueTask({
        type: "fix-backend-structure",
        payload: { missing },
        status: "pending"
      });
    }

    return { missing };
  }

  private static checkSchemas() {
    const schemaDir = path.resolve("backend/data/schemas");
    const badSchemas: string[] = [];

    if (!fs.existsSync(schemaDir)) return { badSchemas, missingDir: true };

    for (const file of fs.readdirSync(schemaDir)) {
      if (!file.endsWith(".schema.json")) continue;
      const full = path.join(schemaDir, file);
      try {
        JSON.parse(fs.readFileSync(full, "utf8"));
      } catch {
        badSchemas.push(file);
      }
    }

    if (badSchemas.length) {
      queueTask({
        type: "repair-schemas",
        payload: { badSchemas },
        status: "pending"
      });
    }

    return { badSchemas };
  }

  private static checkConfigFiles() {
    const required = [
      "config/governance/trust-zones.json",
      "config/governance/policies.json"
    ];

    const missing: string[] = [];

    for (const rel of required) {
      const full = path.resolve(rel);
      if (!fs.existsSync(full)) missing.push(rel);
    }

    if (missing.length) {
      queueTask({
        type: "fix-config-structure",
        payload: { missing },
        status: "pending"
      });
    }

    return { missing };
  }
}
