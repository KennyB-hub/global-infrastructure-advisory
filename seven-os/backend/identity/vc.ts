// backend/identity/vc.ts
// VC helper for expansion flows.

export class VC {
  static async issueForPlan(plan: any, dids: any[], env: any): Promise<any[]> {
    const vcs: any[] = [];

    for (const entry of dids) {
      const vc = await this.issue({
        did: entry.did,
        role: entry.node?.role || "infra-node",
        capabilities: entry.node?.capabilities || [],
        trustZone: entry.node?.trustZone || "PUBLIC",
        jurisdiction: entry.node?.jurisdiction || "unknown",
        orgId: entry.node?.orgId || "unknown"
      }, env);

      vcs.push(vc);
    }

    return vcs;
  }

  static async issue(claims: {
    did: string;
    role: string;
    capabilities: any[];
    trustZone: string;
    jurisdiction: string;
    orgId: string;
  }, env: any): Promise<any> {
    const issuer = env.VC_ISSUER_ID || "did:collective:issuer";
    const now = new Date().toISOString();

    return {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", "CollectiveNodeCredential"],
      issuer,
      issuanceDate: now,
      credentialSubject: claims,
      proof: {
        type: "Ed25519Signature2020",
        created: now,
        proofPurpose: "assertionMethod",
        verificationMethod: issuer + "#keys-1",
        // TODO: replace with real signature
        jws: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9..."
      }
    };
  }
}
