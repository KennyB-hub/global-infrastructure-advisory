import fs from "node:fs";
import path from "node:path";
import fileMap from "./file-map.json" assert { type: "json" };

export class IntegrityCheck {
  static exists(p) {
    return fs.existsSync(path.resolve(p));
  }

  static scan() {
    const missing = [];
    for (const p of fileMap.paths) {
      if (!IntegrityCheck.exists(p)) {
        missing.push(p);
      }
    }
    return { missing, healthy: missing.length === 0 };
  }
}
