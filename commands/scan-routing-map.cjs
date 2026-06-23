const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ROUTES_FILE = path.join(ROOT, "os-routing-map.json");
const LOG = path.join(ROOT, "reports", "os-routing-scan-report.json");

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
  console.log("🔍 Scanning Seven‑OS using os-routing-map.json…");

  const routing = JSON.parse(fs.readFileSync(ROUTES_FILE, "utf8"));
  const routes = routing["os-routes"] || [];
  const allFiles = walk(ROOT);

  const results = [];

  for (const routePath of routes) {
    const expectedAbs = path.join(ROOT, "seven-os", routePath.replace(/^\//, ""));
    const expectedRel = expectedAbs.replace(ROOT + path.sep, "");
    const filename = path.basename(routePath);

    const matches = allFiles.filter(f => path.basename(f) === filename);

    // Correct location
    if (fs.existsSync(expectedAbs)) {
      results.push({
        route: routePath,
        status: "exists",
        location: expectedRel
      });
      continue;
    }

    // No file found anywhere
    if (matches.length === 0) {
      results.push({
        route: routePath,
        status: "missing",
        expected: expectedRel
      });
      continue;
    }

    // Found in wrong place
    if (matches.length === 1) {
      results.push({
        route: routePath,
        status: "misplaced",
        expected: expectedRel,
        found_at: matches[0].replace(ROOT + path.sep, "")
      });
      continue;
    }

    // Found multiple copies
    results.push({
      route: routePath,
      status: "duplicate",
      expected: expectedRel,
      found_at: matches.map(m => m.replace(ROOT + path.sep, ""))
    });
  }

  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.writeFileSync(LOG, JSON.stringify({ results }, null, 2));

  console.log("✅ Scan complete.");
  console.log("📄 See reports/os-routing-scan-report.json");
}

main();

