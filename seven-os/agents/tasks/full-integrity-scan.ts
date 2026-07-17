// full-integrity-scan.ts

import fs from "fs";
import path from "path";
import { queueTask } from "../../autonomous/task-queue";

export class FullIntegrityScan {
  static run() {
    return {
      backend: this.checkBackend(),
      schemas: this.checkSchemas(),
      config: this.checkConfig()
    };
  }

  private static checkBackend() {
    const root = path.resolve("backend");
    const required = ["ai", "security", "services", "workers", "admin", "data"];
    const missing = required.filter(dir => !fs.existsSync(path.join(root, dir)));

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
    const dir = path.resolve("backend/data/schemas");
    if (!fs.existsSync(dir)) return { missingDir: true, bad: [] };

    const bad: string[] = [];

    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".schema.json")) continue;
      try {
        JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
      } catch {
        bad.push(file);
      }
    }

    if (bad.length) {
      queueTask({
        type: "repair-schemas",
        payload: { bad },
        status: "pending"
      });
    }

    return { bad };
  }

  private static checkConfig() {
    const required = [
      "config/governance/trust-zones.json",
      "config/governance/policies.json"
    ];

    const missing = required.filter(rel => !fs.existsSync(path.resolve(rel)));

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
