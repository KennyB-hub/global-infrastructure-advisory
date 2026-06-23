/**
 * Seven‑OS Manifest Loader (Enterprise Grade)
 * -------------------------------------------
 * - Loads seven-os/manifest.json
 * - Validates required fields
 * - Exposes route map for CLI routing
 * - Provides structured error handling
 */

import * as fs from "fs";
import * as path from "path";
import logger = require("../../helpers/logger");

export interface SevenManifest {
  version: string;
  routes: Record<string, string>;
  domains?: Record<string, any>;
  engines?: Record<string, any>;
  [key: string]: any;
}

const ROOT = path.resolve(__dirname, "../../..");
const MANIFEST_PATH = path.join(ROOT, "seven-os", "manifest.json");

/**
 * Safely read JSON file
 */
function safeReadJSON(file: string): any | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    return null;
  }
}

/**
 * Validate manifest structure
 */
export function validateManifest(manifest: SevenManifest): string[] {
  const errors: string[] = [];

  if (!manifest) {
    errors.push("Manifest is null or undefined.");
    return errors;
  }

  if (typeof manifest.version !== "string") {
    errors.push("Manifest missing required field: version");
  }

  if (!manifest.routes || typeof manifest.routes !== "object") {
    errors.push("Manifest missing required field: routes");
  }

  if (!manifest.domains) {
    errors.push("Manifest missing required field: domains");
  }

  if (!manifest.engines) {
    errors.push("Manifest missing required field: engines");
  }

  return errors;
}

/**
 * Load manifest from disk
 */
export function loadManifest(): SevenManifest {
  logger.start("manifest-loader");

  if (!fs.existsSync(MANIFEST_PATH)) {
    logger.error("manifest-loader", new Error(`Manifest not found at ${MANIFEST_PATH}`));
    throw new Error("Seven‑OS manifest missing.");
  }

  const manifest = safeReadJSON(MANIFEST_PATH);

  if (!manifest) {
    logger.error("manifest-loader", new Error("Manifest JSON is invalid."));
    throw new Error("Seven‑OS manifest is invalid JSON.");
  }

  const errors = validateManifest(manifest);

  if (errors.length > 0) {
    logger.warn("Manifest validation failed:");
    for (const e of errors) logger.warn(" - " + e);
    throw new Error("Seven‑OS manifest failed validation.");
  }

  logger.success("manifest-loader");
  return manifest;
}

/**
 * Extract route map for CLI routing
 */
export function getRouteMap(): Record<string, string> {
  const manifest = loadManifest();
  return manifest.routes || {};
}

