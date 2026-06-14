import fs from "fs";
import path from "path";
import { GlobalManifest, EngineDescriptor } from "./types";

interface RoutingIssue {
  type: "MISSING_TARGET" | "UNROUTED_ENGINE" | "WRONG_LAYER";
  route?: string;
  expectedPath?: string;
  actualPath?: string;
  engine?: EngineDescriptor;
}

export function scanRouting(repoRoot: string): RoutingIssue[] {
  const issues: RoutingIssue[] = [];

  const manifestPath = path.join(repoRoot, "seven-os", "global-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("global-manifest.json not found. Run manifest generator first.");
  }

  const manifest: GlobalManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  // 1. Load routing files (adjust paths if yours differ)
  const runtimeRoutesPath = path.join(repoRoot, "runtime", "routing-map.json");
  const domainRoutesPath = path.join(repoRoot, "domain", "routing-map.json");

  const runtimeRoutes = fs.existsSync(runtimeRoutesPath)
    ? JSON.parse(fs.readFileSync(runtimeRoutesPath, "utf8"))
    : {};
  const domainRoutes = fs.existsSync(domainRoutesPath)
    ? JSON.parse(fs.readFileSync(domainRoutesPath, "utf8"))
    : {};

  const allRoutes: Record<string, string> = {
    ...runtimeRoutes,
    ...domainRoutes
  };

  const allEngines: EngineDescriptor[] = [
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

  const enginesByPath = new Map<string, EngineDescriptor>();
  for (const e of allEngines) {
    enginesByPath.set(e.path, e);
  }

  // 2. Check each route target
  for (const [route, target] of Object.entries(allRoutes)) {
    const normalizedTarget = target.replace(/\\/g, "/");
    const engine = enginesByPath.get(normalizedTarget);

    if (!engine) {
      issues.push({
        type: "MISSING_TARGET",
        route,
        expectedPath: normalizedTarget
      });
      continue;
    }

    // Example layer sanity check: runtime routes should not point into domain/*
    if (route.startsWith("runtime/") && engine.path.startsWith("domain/")) {
      issues.push({
        type: "WRONG_LAYER",
        route,
        expectedPath: "runtime/*",
        actualPath: engine.path,
        engine
      });
    }
  }

  // 3. Find engines that have no route at all
  const routedTargets = new Set(
    Object.values(allRoutes).map(t => t.replace(/\\/g, "/"))
  );

  for (const engine of allEngines) {
    if (!routedTargets.has(engine.path)) {
      issues.push({
        type: "UNROUTED_ENGINE",
        engine
      });
    }
  }

  return issues;
}
