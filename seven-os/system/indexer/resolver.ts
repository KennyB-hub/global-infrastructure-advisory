// seven-os/system/indexer/resolver.ts
import fs from "fs";
import path from "path";
import { GlobalManifest, EngineDescriptor, EngineKind } from "./types";

export class EngineResolver {
  private manifest: GlobalManifest;

  constructor(repoRoot: string) {
    const manifestPath = path.join(repoRoot, "seven-os", "global-manifest.json");

    if (!fs.existsSync(manifestPath)) {
      throw new Error("global-manifest.json not found. Run generator first.");
    }

    const raw = fs.readFileSync(manifestPath, "utf8");
    this.manifest = JSON.parse(raw);
  }

  //
  // === Resolve by ID ===
  //
  getById(id: string): EngineDescriptor | null {
    for (const section of Object.values(this.manifest)) {
      if (Array.isArray(section)) {
        const found = section.find(e => e.id === id);
        if (found) return found;
      }
    }
    return null;
  }

  //
  // === Resolve by path ===
  //
  getByPath(filePath: string): EngineDescriptor | null {
    const normalized = filePath.replace(/\\/g, "/");

    for (const section of Object.values(this.manifest)) {
      if (Array.isArray(section)) {
        const found = section.find(e => e.path === normalized);
        if (found) return found;
      }
    }
    return null;
  }

  //
  // === Resolve by engine kind ===
  //
  getByKind(kind: EngineKind): EngineDescriptor[] {
    const results: EngineDescriptor[] = [];

    for (const section of Object.values(this.manifest)) {
      if (Array.isArray(section)) {
        results.push(...section.filter(e => e.kind === kind));
      }
    }

    return results;
  }

  //
  // === Resolve by sector ===
  //
  getBySector(sector: string): EngineDescriptor[] {
    const results: EngineDescriptor[] = [];

    for (const section of Object.values(this.manifest)) {
      if (Array.isArray(section)) {
        results.push(...section.filter(e => e.sector === sector));
      }
    }

    return results;
  }

  //
  // === Resolve by section (runtime, os_core, domain, etc.) ===
  //
  getSection(section: keyof GlobalManifest): EngineDescriptor[] {
    const value = this.manifest[section];
    return Array.isArray(value) ? value : [];
  }

  //
  // === Resolve runtime engines (autonomy level 3) ===
  //
  getRuntimeEngines(): EngineDescriptor[] {
    return this.manifest.runtime;
  }

  //
  // === Resolve all engines ===
  //
  getAll(): EngineDescriptor[] {
    const all: EngineDescriptor[] = [];

    for (const section of Object.values(this.manifest)) {
      if (Array.isArray(section)) {
        all.push(...section);
      }
    }

    return all;
  }
}
