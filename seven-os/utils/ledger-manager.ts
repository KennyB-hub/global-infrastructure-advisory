import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export class SevenOsLedgerManager {
    private ledgerPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");

    public readLedger(): any {
        if (!existsSync(this.ledgerPath)) return null;
        try { return JSON.parse(readFileSync(this.ledgerPath, "utf-8")); }
        catch { return null; }
    }

    public logWorkerEvidence(workerName: string, status: string, executionState: string): void {
        const ledger = this.readLedger();
        if (!ledger) return;

        const worker = ledger.workforceManifest.find((w: any) => w.name.toLowerCase() === workerName.toLowerCase());
        const currentTimestamp = new Date().toISOString();

        if (worker) {
            worker.status = status;
            worker.evidenceMatrix.lastAudit = currentTimestamp;
            worker.evidenceMatrix.executionStatus = executionState;
            ledger.meta.updatedAt = currentTimestamp;

            try { writeFileSync(this.ledgerPath, JSON.stringify(ledger, null, 4), "utf-8"); }
            catch (e) { console.error("❌ Ledger sync failed:", e); }
        }
    }
}
