// Seven‑OS System Manifest Builder
// Generates global-manifest.json from all OS components

const fs = require("fs");
const path = require("path");

function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error("❌ Failed to load:", filePath, err.message);
    return null;
  }
}

function loadDirectory(dir) {
  const results = {};
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      results[file] = loadDirectory(full);
      continue;
    }

    if (file.endsWith(".json")) {
      const key = file.replace(".json", "");
      results[key] = loadJSON(full);
    }
  }

  return results;
}

function buildManifest() {
  const root = path.join(process.cwd(), "seven-os");

  const manifest = {
    version: "1.0",
    generated_at: new Date().toISOString(),
    engines: loadDirectory(path.join(root, "engines")),
    workers: loadDirectory(path.join(root, "workers")),
    ai_logs: loadDirectory(path.join(root, "ai/logs")),
    backend: loadDirectory(path.join(root, "backend")),
    sectors: loadDirectory(path.join(root, "sectors")),
    topology: loadDirectory(path.join(root, "topology")),
    infrastructure_packs: loadDirectory(path.join(root, "infrastructure-packs")),
    policy_packs: loadDirectory(path.join(root, "policy-packs")),
    system: loadDirectory(path.join(root, "system")),
    hubs: loadDirectory(path.join(root, "hubs")),
    functions: loadDirectory(path.join(root, "functions"))
  };

  const outPath = path.join(root, "global-manifest.json");
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));

  console.log("✅ Seven‑OS global manifest built successfully");
  console.log("📄 Output:", outPath);
}

buildManifest();
