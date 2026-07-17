import fs from "fs";
import path from "path";

export class SevenEngineValidator {
  /**
   * Validate that an engine file exists, loads, and exports required fields.
   */
  static validateEngine(enginePath: string) {
    const full = path.resolve(enginePath);

    if (!fs.existsSync(full)) {
      throw new Error(`Engine missing: ${enginePath}`);
    }

    const mod = require(full);

    if (!mod) {
      throw new Error(`Engine failed to load: ${enginePath}`);
    }

    // Required exports for Seven‑OS engines
    const required = ["id", "run", "version"];

    for (const field of required) {
      if (!(field in mod)) {
        throw new Error(
          `Engine '${enginePath}' missing required export '${field}'`
        );
      }
    }

    return true;
  }

  /**
   * Validate all engines inside a folder.
   */
  static validateFolder(folderPath: string) {
    const full = path.resolve(folderPath);

    if (!fs.existsSync(full)) {
      throw new Error(`Engine folder missing: ${folderPath}`);
    }

    const files = fs.readdirSync(full);

    const results = [];

    for (const file of files) {
      if (!file.endsWith(".js")) continue;

      const enginePath = path.join(full, file);

      try {
        this.validateEngine(enginePath);
        results.push({ engine: file, status: "OK" });
      } catch (err) {
        results.push({ engine: file, status: "ERROR", error: err.message });
      }
    }

    return results;
  }

  /**
   * Validate all Seven‑OS engine roots.
   */
  static validateAllRoots() {
    const roots = [
      "seven-os/ai",
      "seven-os/engines",
      "seven-os/autonomous",
      "seven-os/backend",
      "seven-os/sector/engines",
      "seven-os/seven-runtime",
      "seven-os/sync",
      "seven-os/geo",
      "seven-os/voice",
      "seven-os/interop"
    ];

    const report = {};

    for (const root of roots) {
      try {
        report[root] = this.validateFolder(root);
      } catch (err) {
        report[root] = [{ engine: root, status: "ERROR", error: err.message }];
      }
    }

    return report;
  }
}
