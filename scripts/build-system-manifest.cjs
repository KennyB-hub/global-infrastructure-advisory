// Seven‑OS System Manifest Builder (Current Layout Edition)

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
  if (!fs.existsSync(dir)) return {}; // prevents crashes

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

    // Your CURRENT folder layout
    engines: loadDirectory(path.join(root, "engines")),
    autonomous: loadDirectory(path.join(root, "autonomous")),
    seven_runtime: loadDirectory(path.join(root, "seven-runtime")),

    backend: loadDirectory(path.join(root, "backend")),
    system: loadDirectory(path.join(root, "system")),
    config: loadDirectory(path.join(root, "config")),
    data: loadDirectory(path.join(root, "data")),

    // Optional folders (only included if they exist)
    ai: loadDirectory(path.join(root, "ai")),
    platform: loadDirectory(path.join(root, "platform"))
  };

  const outPath = path.join(root, "global-manifest.json");
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));

  console.log("✅ Seven‑OS global manifest built successfully");
  console.log("📄 Output:", outPath);
}

buildManifest();
