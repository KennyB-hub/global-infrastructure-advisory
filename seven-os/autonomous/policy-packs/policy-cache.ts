// policy-cache.ts – V12 Alpha
// In-memory cache for sovereign policy bundles.

import { SovereignPolicyLoader } from "./sovereign-policy-loader.js";
import { PolicyValidator } from "./policy-validator.js";
import { PolicyHasher } from "./policy-hasher.js";

export class PolicyCache {
  private static cache: any = null;
  private static lastHash: string | null = null;

  static async get(): Promise<any> {
    // If cached, return immediately
    if (this.cache) return this.cache;

    // Load fresh bundle
    const bundle = await SovereignPolicyLoader.load();

    // Validate
    const validation = PolicyValidator.validate(bundle);
    if (!validation.ok) {
      throw new Error("Policy validation failed: " + validation.errors.join(", "));
    }

    // Hash bundle
    const hashes = await PolicyHasher.hashBundle(bundle);
    this.lastHash = hashes.merged;

    // Store in cache
    this.cache = {
      bundle,
      hashes,
      loadedAt: new Date().toISOString()
    };

    return this.cache;
  }

  static clear(): void {
    this.cache = null;
    this.lastHash = null;
  }
}
