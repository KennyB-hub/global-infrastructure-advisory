// seven-os/manifest/loader.ts
import manifest from "seven-os/sectors/global-manifest.json" assert { type: "json" };

export type GlobalManifest = typeof manifest;

let cache: GlobalManifest | null = null;

export function loadGlobalManifest(): GlobalManifest {
  if (cache) return cache;
  cache = manifest;
  return cache;
}
