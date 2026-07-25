import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export class SevenOsFinancialBridge {
    private r2VaultPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");

    public ingestProjectBudget(project: any): boolean {
        console.log(`\n💳 [Finance-Core] Ingesting Budget Matrix: [${project.projectId.toUpperCase()}]`);
        let totalAllocated = 0;

        project.lineItems.forEach((item: any) => {
            totalAllocated += item.allocated;
            let targetSector = "shared";
            if (item.tags.includes("agriculture")) targetSector = "agri";
            else if (item.tags.includes("drone")) targetSector = "logistics";
            
            console.log(`   🔗 Binding Allocation: [${item.id}] ($${item.allocated}) -> sector/${targetSector}/`);
        });

        this.syncProjectToR2Ledger(project);
        return true;
    }

    private syncProjectToR2Ledger(project: any): void {
        if (!existsSync(this.r2VaultPath)) return;
        try {
            const ledger = JSON.parse(readFileSync(this.r2VaultPath, "utf-8"));
            ledger.meta.activeProject = project.projectId;
            ledger.meta.projectFundingSource = project.contractMeta.fundingSource;
            ledger.meta.lastFinancialAudit = new Date().toISOString();
            writeFileSync(this.r2VaultPath, JSON.stringify(ledger, null, 4), "utf-8");
            console.log(`💾 [R2-Stack] Financial context synchronized to workforce ledger state.`);
        } catch {}
    }
}
