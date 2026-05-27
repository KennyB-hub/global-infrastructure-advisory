// policy-hasher.ts – V12 Alpha
// Computes SHA-256 hashes for sovereign policy packs.

export class PolicyHasher {
  static async hashObject(obj: any): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(obj));
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  static async hashBundle(bundle: any): Promise<any> {
    return {
      manifest: await this.hashObject(bundle.manifest),
      globalPolicy: await this.hashObject(bundle.global),
      sovereignOverrides: await this.hashObject(bundle.overrides),
      trustZones: await this.hashObject(bundle.trustZones),
      merged: await this.hashObject(bundle.merged)
    };
  }
}
