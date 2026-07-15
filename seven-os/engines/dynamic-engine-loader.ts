import fs from "fs";
import path from "path";

export function loadDynamicEngines(baseDir) {
  const engines = {};

  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scan(full);
      }

      if (entry.isFile() && entry.name.endsWith("-engine.js")) {
        const mod = require(full);
        const EngineClass = Object.values(mod)[0];
        const engineName = entry.name.replace(".js", "");
        engines[engineName] = new EngineClass();
      }
    }
  }

  scan(baseDir);
  return engines;
}
