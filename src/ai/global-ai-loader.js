// global-ai-loader.js
// V12 Alpha – Global AI Engine Loader

const fs = require("fs");
const path = require("path");

// Hard‑wired V12 Alpha manifest path (adjust if needed)
const ENGINE_MANIFEST_PATH = path.join(
  __dirname,
  "GLOBAL_AI_ENGINE_INDEX_V12_ALPHA.json"
);

// V12 Alpha security doctrine
const V12_ALPHA = {
  version: "12.0.0-alpha",
  minAutonomyLevel: 1,
  allowedTrustZones: ["admin", "gov", "deepgov", "system"]
};

function loadManifest() {
  const raw = fs.readFileSync(ENGINE_MANIFEST_PATH, "utf8");
  const manifest = JSON.parse(raw);

  if (manifest.version !== V12_ALPHA.version) {
    throw new Error(
      `Global AI Engine Manifest version mismatch. Expected ${V12_ALPHA.version}, got ${manifest.version}`
    );
  }

  if (!Array.isArray(manifest.engines)) {
    throw new Error("Global AI Engine Manifest is missing 'engines' array.");
  }

  return manifest;
}

function validateEngineEntry(engine) {
  if (!engine.engineId || !engine.path) {
    throw new Error(`Invalid engine entry: missing engineId or path: ${JSON.stringify(engine)}`);
  }

  if (typeof engine.autonomyLevel !== "number") {
    throw new Error(`Engine ${engine.engineId} missing numeric autonomyLevel.`);
  }

  if (engine.autonomyLevel < V12_ALPHA.minAutonomyLevel) {
    throw new Error(
      `Engine ${engine.engineId} autonomyLevel ${engine.autonomyLevel} below V12 Alpha minimum ${V12_ALPHA.minAutonomyLevel}.`
    );
  }

  if (!V12_ALPHA.allowedTrustZones.includes(engine.trustZone)) {
    throw new Error(
      `Engine ${engine.engineId} has invalid trustZone '${engine.trustZone}' for V12 Alpha.`
    );
  }
}

function buildEngineRegistry(manifest) {
  const registry = new Map();

  for (const engine of manifest.engines) {
    validateEngineEntry(engine);

    const enginePath = path.isAbsolute(engine.path)
      ? engine.path
      : path.join(process.cwd(), engine.path);

    registry.set(engine.engineId, {
      ...engine,
      resolvedPath: enginePath,
      loaded: false,
      module: null
    });
  }

  return registry;
}

// Load manifest + build registry once (singleton)
const manifest = loadManifest();
const engineRegistry = buildEngineRegistry(manifest);

function loadEngineModule(engineMeta) {
  if (engineMeta.loaded && engineMeta.module) {
    return engineMeta.module;
  }

  // V12 Alpha: enforce existence
  if (!fs.existsSync(engineMeta.resolvedPath)) {
    throw new Error(
      `Engine module not found for ${engineMeta.engineId} at ${engineMeta.resolvedPath}`
    );
  }

  // Require dynamically
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const mod = require(engineMeta.resolvedPath);

  engineMeta.loaded = true;
  engineMeta.module = mod;

  return mod;
}

// Public API

/**
 * Get engine metadata (no module load).
 */
function getEngineMeta(engineId) {
  const meta = engineRegistry.get(engineId);
  if (!meta) {
    return null;
  }
  // Return a shallow copy without module reference
  const { module, ...rest } = meta;
  return rest;
}

/**
 * Get engine module (lazy‑loaded), with V12 Alpha checks already enforced.
 */
function getEngine(engineId) {
  const meta = engineRegistry.get(engineId);
  if (!meta) {
    throw new Error(`Engine '${engineId}' not found in V12 Alpha registry.`);
  }
  return loadEngineModule(meta);
}

/**
 * Require engine and assert minimum autonomy + trustZone at call‑time.
 */
function requireEngine(engineId, options = {}) {
  const { minAutonomyLevel, allowedTrustZones } = options;
  const meta = engineRegistry.get(engineId);

  if (!meta) {
    throw new Error(`Engine '${engineId}' not found in V12 Alpha registry.`);
  }

  if (typeof minAutonomyLevel === "number" && meta.autonomyLevel < minAutonomyLevel) {
    throw new Error(
      `Engine '${engineId}' autonomyLevel ${meta.autonomyLevel} below required ${minAutonomyLevel}.`
    );
  }

  if (Array.isArray(allowedTrustZones) && allowedTrustZones.length > 0) {
    if (!allowedTrustZones.includes(meta.trustZone)) {
      throw new Error(
        `Engine '${engineId}' trustZone '${meta.trustZone}' not in allowed set ${JSON.stringify(
          allowedTrustZones
        )}.`
      );
    }
  }

  return loadEngineModule(meta);
}

/**
 * List all engines with basic metadata.
 */
function listEngines() {
  return Array.from(engineRegistry.values()).map((e) => {
    const { module, ...rest } = e;
    return rest;
  });
}

module.exports = {
  V12_ALPHA,
  getEngineMeta,
  getEngine,
  requireEngine,
  listEngines
};
