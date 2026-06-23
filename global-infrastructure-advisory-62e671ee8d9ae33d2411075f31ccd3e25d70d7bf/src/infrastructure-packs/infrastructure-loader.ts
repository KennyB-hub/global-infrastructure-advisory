// infrastructure-loader.ts – V12 Alpha
// Loads infrastructure-manifest.json and all infra packs into a unified bundle.

import manifest from "./infrastructure-manifest.json";

export interface InfraDomainEntry {
  id: string;
  file: string;
  version: string;
}

export interface InfrastructureBundle {
  manifest: any;
  domains: InfraDomainEntry[];
  packs: Record<string, any>;
}

export class InfrastructureLoader {
  static async load(): Promise<InfrastructureBundle> {
    const domains: InfraDomainEntry[] = manifest.domains || [];
    const packs: Record<string, any> = {};

    for (const domain of domains) {
      // Dynamic import per infra pack
      const mod = await import(`./${domain.file}`);
      packs[domain.id] = mod.default ?? mod;
    }

    return {
      manifest,
      domains,
      packs
    };
  }

  static async getDomain(id: string): Promise<any | null> {
    const bundle = await this.load();
    return bundle.packs[id] ?? null;
  }
}
