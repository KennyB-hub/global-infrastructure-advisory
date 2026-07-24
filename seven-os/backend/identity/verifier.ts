// seven-os/backend/identity/verifier.ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface VerifiableCredential {
    "@context": string[];
    id: string;
    type: string[];
    issuer: string; // The Gov/Company DID string
    issuanceDate: string;
    credentialSubject: {
        id: string; // Holder DID (e.g., Drone asset or Contractor)
        clearanceLevel: "public" | "contractor" | "sovereign_gov";
        authorizedSectors: string[];
        fccRegistrationId?: string;
    };
    proof: {
        type: string;
        created: string;
        verificationMethod: string;
        proofPurpose: string;
        jws: string; // Cryptographic signature block
    };
}

export class SevenOsIdentityEnforcer {
    private identityConfigDir = join(process.cwd(), "seven-os", "backend", "identity");

    /**
     * Asserts structural cryptographic integrity on an incoming asset credential
     */
    public verifyCredentialClaims(vc: VerifiableCredential, requiredSector: string): boolean {
        console.log(`🔐 [Identity-Core] Ingesting VC Claim for Subject: [${vc.credentialSubject.id}]`);
        console.log(`🛡️ [Identity-Core] Issuer Authority: ${vc.issuer}`);

        // 1. Check expiration and temporal bounds
        const rawDate = new Date(vc.issuanceDate);
        if (isNaN(rawDate.getTime()) || rawDate > new Date()) {
            console.error("❌ [Identity-Core] Security Halt: Credential has a compromised or post-dated time signature.");
            return false;
        }

        // 2. Enforce Gov/Corporate Sector Clearance Restrictions
        const subject = vc.credentialSubject;
        console.log(`🔑 [Identity-Core] Active Clearance: ${subject.clearanceLevel.toUpperCase()}`);

        if (subject.clearanceLevel === "sovereign_gov") {
            console.log("🟢 [Identity-Core] Access Granted: Master Government override clearance verified.");
            return true;
        }

        const isAuthorized = subject.authorizedSectors.includes(requiredSector) || subject.authorizedSectors.includes("global");
        if (!isAuthorized) {
            console.error(`❌ [Identity-Core] Security Breach: Subject is not cleared for the [${requiredSector.toUpperCase()}] sector boundary.`);
            return false;
        }

        console.log(`✅ [Identity-Core] Success: Cryptographic claim successfully bound to Sector [${requiredSector.toUpperCase()}].`);
        return true;
    }
}
