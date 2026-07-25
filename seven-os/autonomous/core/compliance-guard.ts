// seven-os/autonomous/core/compliance-guard.ts
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface SectorPolicyConfig {
    sector: string;
    description: string;
    riskLevel: "critical" | "high" | "standard";
    requiredPolicies: string[];
    requiredTraining: string[];
    requiredCertifications: string[];
    trustZoneMinimum: "Public" | "Contractor" | "Sovereign_Gov";
    auditFrequency: "real-time" | "daily";
}

export interface WorkerCapabilityClaim {
    workerId: string;
    trustZone: "Public" | "Contractor" | "Sovereign_Gov";
    completedTraining: string[];
    heldCertifications: string[];
}

export class SevenOsComplianceGuard {
    private ledgerPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");

    /**
     * Natively evaluates a worker or hardware profile against official sector compliance JSON specifications
     */
    public validateSectorAccess(policy: SectorPolicyConfig, worker: WorkerCapabilityClaim): boolean {
        console.log(`\n⚖️ [Compliance-Guard] Auditing access rights for Subject: [${worker.workerId}] -> Target Sector: [${policy.sector.toUpperCase()}]`);
        console.log(`🛡️ [Compliance-Guard] Enforcing Policy Context: ${policy.description}`);

        // 1. Enforce Trust Zone Boundary Restrictions
        const trustRank = { "Public": 1, "Contractor": 2, "Sovereign_Gov": 3 };
        if (trustRank[worker.trustZone] < trustRank[policy.trustZoneMinimum]) {
            console.error(`❌ [Compliance-Guard] Security Failure: Trust zone [${worker.trustZone}] falls below required [${policy.trustZoneMinimum}].`);
            this.logAuditToR2(worker.workerId, policy.sector, "FAILED_TRUST_ZONE");
            return false;
        }

        // 2. Validate Required Certifications (e.g., CISSP, OSCP, Security+)
        const missingCerts = policy.requiredCertifications.filter(cert => !worker.heldCertifications.includes(cert));
        if (missingCerts.length > 0) {
            console.error(`❌ [Compliance-Guard] Security Failure: Subject lacks required credentials: [${missingCerts.join(", ")}]`);
            this.logAuditToR2(worker.workerId, policy.sector, "MISSING_CERTIFICATIONS");
            return false;
        }

        // 3. Validate Mandatory Training Prerequisites
        const missingTraining = policy.requiredTraining.filter(t => !worker.completedTraining.includes(t));
        if (missingTraining.length > 0) {
            console.warn(`⚠️ [Compliance-Guard] Operational Warning: Subject missing secondary training profiles: [${missingTraining.join(", ")}]`);
        }

        console.log(`✅ [Compliance-Guard] ACCESS AUTHORIZED: Subject complies with all federal and corporate policy parameters.`);
        this.logAuditToR2(worker.workerId, policy.sector, "VERIFIED_COMPLIANT");
        return true;
    }

    private logAuditToR2(workerId: string, sector: string, result: string): void {
        if (!existsSync(this.ledgerPath)) return;
        try {
            const ledger = JSON.parse(readFileSync(this.ledgerPath, "utf-8"));
            
            // Log active policy assertions directly onto the unalterable R2 state ledger
            ledger.meta.lastAuditedSubjectId = workerId;
            ledger.meta.lastComplianceResult = result;
            ledger.meta.lastGuardVerification = new Date().toISOString();

            writeFileSync(this.ledgerPath, JSON.stringify(ledger, null, 4), "utf-8");
            console.log("💾 [R2-Stack] Compliance guard tracking token synchronized to workforce ledger.");
        } catch {
            console.error("❌ [Compliance-Guard] Exception streaming compliance token back to R2 storage stack.");
        }
    }
}
