// seven-os/autonomous/core/system-trigger.ts
import { SevenOsSectorAuditEngine } from "..\..\sector\shared\sector-audit-engine.ts";
import { SevenOsFinancialAuditEngine } from "..\..\sector\shared\financial-audit-engine.ts";

export class SevenOsMasterTrigger {
    private sectorAuditor = new SevenOsSectorAuditEngine();
    private financialAuditor = new SevenOsFinancialAuditEngine();

    /**
     * Triggers a comprehensive system-wide compliance sweep
     */
    public executeGlobalAuditSequence(projectPayload: any): void {
        console.log("\n⚡ [Master-Trigger] Initiating scheduled Government Trust Compliance verification loop...");
        
        // 1. Run the structural sector boundary sweep
        const sectorReports = this.sectorAuditor.auditAllSectors();
        console.log(`📊 [Master-Trigger] Boundary check completed across ${sectorReports.length} operational sectors.`);

        // 2. Run the financial procurement compliance verification
        const financePacket = {
            projectId: projectPayload.projectId,
            totalBudget: projectPayload.totalBudget,
            expendituresToDate: projectPayload.expendituresToDate,
            naicsVerified: projectPayload.contractMeta?.naics || [],
            pscVerified: projectPayload.contractMeta?.psc || [],
            fundingSource: projectPayload.contractMeta?.fundingSource || "federal"
        };

        const isFinanciallyCompliant = this.financialAuditor.auditGovProjectCompliance(financePacket);
        
        if (isFinanciallyCompliant) {
            console.log("🟢 [Master-Trigger] SYSTEM POSTURE: SECURE & VERIFIED COMPLIANT FOR FEDERAL WORK.");
        } else {
            console.error("🚨 [Master-Trigger] CRITICAL COMPLIANCE BREAK DETECTED!");
        }
    }
}

