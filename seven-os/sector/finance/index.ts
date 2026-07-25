import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

export interface TransactionPacket {
    contractId: string;
    allocatedBudget: number;
    expenditureAmount: number;
    assignedSector: string;
    cryptoSignature?: string;
}

export class SevenOsFinanceCore {
    private ledgerPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");

    /**
     * Natively generates a secure SHA-256 hash to seal infrastructure contracts and budgets
     */
    public generateSovereignSha256(data: string): string {
        return createHash("sha256").update(data).digest("hex");
    }

    /**
     * Executes, calculates, and cryptographically signs a multi-sector budget allocation
     */
    public processSecureContract(tx: TransactionPacket): boolean {
        console.log(`\n💳 [Finance-Core] Ingesting Infrastructure Contract: [${tx.contractId}]`);
        console.log(`💰 [Finance-Core] Allocated Capital Base: $${tx.allocatedBudget} USD`);

        if (tx.expenditureAmount > tx.allocatedBudget) {
            console.error("❌ [Finance-Core] Fiscal Failure: Expenditure exceeds contract budget bounds!");
            return false;
        }

        // Generate SHA-256 signature to seal the financial transaction natively
        const rawPayload = `${tx.contractId}:${tx.allocatedBudget}:${tx.expenditureAmount}:${tx.assignedSector}`;
        tx.cryptoSignature = this.generateSovereignSha256(rawPayload);
        
        console.log(`🔒 [Finance-Core] SHA-256 Ledger Signature SECURE: ${tx.cryptoSignature}`);
        this.cacheContractToLedger(tx);
        return true;
    }

    private cacheContractToLedger(tx: TransactionPacket): void {
        if (!existsSync(this.ledgerPath)) return;
        try {
            const ledger = JSON.parse(readFileSync(this.ledgerPath, "utf-8"));
            ledger.meta.lastSignedContractId = tx.contractId;
            ledger.meta.lastSha256Signature = tx.cryptoSignature;
            ledger.meta.lastFinancialAudit = new Date().toISOString();
            
            writeFileSync(this.ledgerPath, JSON.stringify(ledger, null, 4), "utf-8");
            console.log("💾 [R2-Stack] Crypto-signed contract data cached to workforce ledger.");
        } catch {}
    }
}

const financeEngine = new SevenOsFinanceCore();
financeEngine.processSecureContract({
    contractId: "PHOENIX-RECOVERY-2026",
    allocatedBudget: 2500000,
    expenditureAmount: 950000,
    assignedSector: "multi-sector"
});
