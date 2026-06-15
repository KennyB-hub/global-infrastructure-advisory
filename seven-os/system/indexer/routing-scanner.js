// seven-os/system/indexer/routing-scanner.js
import fs from "fs";
import path from "path";

export function scanRouting(repoRoot) {
  const issues = [];

  const manifestPath = path.join(repoRoot, "seven-os", "global-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("global-manifest.json not found. Run manifest generator first.");
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  // Load routing maps (adjust if your paths differ)
  const routingFiles = [
    path.join(repoRoot, "runtime", "routing-map.json"),
    path.join(repoRoot, "domain", "routing-map.json"),
    path.join(repoRoot, "seven-os", "routing-map.json"),
    path.join(repoRoot, "utilities", "routing-map.json")
  ];

  const routes = {};

  for (const file of routingFiles) {
    if (fs.existsSync(file)) {
      Object.assign(routes, JSON.parse(fs.readFileSync(file, "utf8")));
    }
  }

  // Flatten manifest engines
  const allEngines = [
    ...manifest.runtime,
    ...manifest.os_core,
    ...manifest.domain,
    ...manifest.api,
    ...manifest.utilities,
    ...manifest.workers,
    ...manifest.dashboard,
    ...manifest.services,
    ...manifest.interop,
    ...manifest.intelligence
  ];

  const enginesByPath = new Map();
  for (const e of allEngines) enginesByPath.set(e.path, e);

  // 1. Check each route target
  for (const [route, target] of Object.entries(routes)) {
    const normalized = target.replace(/\\/g, "/");

    // Old seven-runtime reference
    if (normalized.includes("seven-runtime")) {
      issues.push({
        type: "OLD_PATH",
        route,
        target: normalized,
        message: "Route still points to seven-runtime/, which no longer exists."
      });
      continue;
    }

    const engine = enginesByPath.get(normalized);

    if (!engine) {
      issues.push({
        type: "MISSING_TARGET",
        route,
        target: normalized,
        message: "Route points to a file that does not exist in the manifest."
      });
      continue;
    }

    // Wrong-layer detection
    if (route.startsWith("runtime/") && !engine.path.startsWith("runtime/")) {
      issues.push({
        type: "WRONG_LAYER",
        route,
        target: normalized,
        expected: "runtime/*",
        actual: engine.path
      });
    }
  }

  // 2. Find engines that have no route at all
  const routedTargets = new Set(
    Object.values(routes).map(t => t.replace(/\\/g, "/"))
  );

  for (const engine of allEngines) {
    if (!routedTargets.has(engine.path)) {
      issues.push({
        type: "UNROUTED_ENGINE",
        engine: engine.id,
        path: engine.path
      });
    }
  }

  return issues;
}
