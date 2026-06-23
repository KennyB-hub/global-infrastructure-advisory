import fs from "fs";
import path from "path";
import { queueTask } from "../autonomous/task-queue";

export class DroneIntegrity {
  static checkBackend() {
    const backendPath = path.resolve("backend");

    const required = [
      "ai",
      "security",
      "services",
      "workers",
      "admin",
      "data"
    ];

    const missing: string[] = [];

    for (const dir of required) {
      if (!fs.existsSync(path.join(backendPath, dir))) {
        missing.push(dir);
      }
    }

    if (missing.length > 0) {
      queueTask({
        type: "fix-backend-structure",
        payload: { missing },
        status: "pending"
      });
    }

    return missing;
  }

  static checkSchemas() {
    const schemaDir = path.resolve("backend/data/schemas");
    const files = fs.readdirSync(schemaDir);

    const badSchemas: string[] = [];

    for (const file of files) {
      if (file.endsWith(".schema.json")) {
        try {
          JSON.parse(fs.readFileSync(path.join(schemaDir, file), "utf8"));
        } catch {
          badSchemas.push(file);
        }
      }
    }

    if (badSchemas.length > 0) {
      queueTask({
        type: "repair-schemas",
        payload: { badSchemas },
        status: "pending"
      });
    }

    return badSchemas;
  }
}
