const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ROUTES_FILE = path.join(ROOT, "os-routing-map.json");
const LOG = path.join(ROOT, "reports", "routing-restore-log.json");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      if (entry === "node_modules") continue;
      if (entry === ".git") continue;
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function main() {
  console.log("🔧 Routing restore using os-routing-map.json…");

  const routing = JSON.parse(fs.readFileSync(ROUTES_FILE, "utf8"));
  const routes = routing["os-routes"] || [];
  const allFiles = walk(ROOT);

  // filename → [paths]
  const byName = new Map();
  for (const full of allFiles) {
    const name = path.basename(full);
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(full);
  }

  const results = [];

  for (const routePath of routes) {
    const expectedAbs = path.join(
      ROOT,
      "seven-os",
      routePath.replace(/^\//, "")
    );
    const expectedRel = expectedAbs.replace(ROOT + path.sep, "");
    const filename = path.basename(routePath);

    // already in correct place
    if (fs.existsSync(expectedAbs)) {
      results.push({
        route: routePath,
        status: "exists",
        location: expectedRel
      });
      continue;
    }

    const candidates = byName.get(filename) || [];

    if (candidates.length === 0) {
      results.push({
        route: routePath,
        status: "missing",
        expected: expectedRel
      });
      continue;
    }

    // pick first candidate and move it
    const from = candidates.shift();
    if (candidates.length === 0) byName.delete(filename);

    ensureDir(path.dirname(expectedAbs));

    if (fs.existsSync(from)) {
      fs.renameSync(from, expectedAbs);
      results.push({
        route: routePath,
        status: "moved",
        from: from.replace(ROOT + path.sep, ""),
        to: expectedRel
      });
    } else {
      results.push({
        route: routePath,
        status: "skipped-missing-at-move",
        from: from.replace(ROOT + path.sep, ""),
        to: expectedRel
      });
    }
  }

  ensureDir(path.dirname(LOG));
  fs.writeFileSync(LOG, JSON.stringify({ results }, null, 2));

  console.log("✅ Routing restore pass complete.");
  console.log("📄 See reports/routing-restore-log.json");
}

main();
