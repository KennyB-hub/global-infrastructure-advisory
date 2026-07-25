// seven-os/sector/finance/finance-bridge.ts
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface BudgetLineItem {
    id: string;
    label: string;
    allocated: number;
    actual: number;
    tags: string[];
}

export interface ProjectManifest {
    projectId: string;
    sector: string;
    currency: string;
    totalBudget: number;
    timeframe: { start: string; end: string };
    lineItems: BudgetLineItem[];
    contractMeta: {
        samUei: string | null;
        naics: string[];
        psc: string[];
        fundingSource: string;
        contractId: string | null;
    };
}

export class SevenOsFinancialBridge {
    private r2VaultPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");

    /**
     * Ingests a new corporate or government project budget matrix and links allocations to sectors
     */
    public ingestProjectBudget(project: ProjectManifest): boolean {
        console.log(`\n💳 [Finance-Core] Ingesting Budget Matrix for Project: [${project.projectId.toUpperCase()}]`);
        console.log(`💰 [Finance-Core] Total Allocated Capital: ${project.totalBudget} ${project.currency}`);
        
        let rollingAllocationTotal = 0;

        // 1. Process and bind each line item to its correct operational sector folder path
        project.lineItems.forEach(item => {
            rollingAllocationTotal += item.allocated;
            
            // Fuzzy match the best sector target based on project tags
            let targetSector = "shared";
            if (item.tags.includes("agriculture")) targetSector = "agri";
            else if (item.tags.includes("drone") || item.tags.includes("mapping")) targetSector = "logistics";
            else if (item.tags.includes("roads") || item.tags.includes("bridges") || item.tags.includes("water")) targetSector = "shared";

            console.log(`   🔗 Binding Allocation: [${item.id}] ($${item.allocated}) -> sector/${targetSector}/`);
        });

        // 2. Budget verification check
        if (rollingAllocationTotal !== project.totalBudget) {
            console.error("❌ [Finance-Core] Capital Mismatch Error: Sum of line items does not equal project total budget!");
            return false;
        }

        console.log("✅ [Finance-Core] Success: Budget matrix securely bound and allocated to active sectors.");
        this.syncProjectToR2Ledger(project);
        return true;
    }

    private syncProjectToR2Ledger(project: ProjectManifest): void {
        if (!existsSync(this.r2VaultPath)) return;
        try {
            const rawData = readFileSync(this.r2VaultPath, "utf-8");
            const ledger = JSON.parse(rawData);

            // Attach active funding profile metadata block to her ledger state engine
            ledger.meta.activeProject = project.projectId;
            ledger.meta.projectFundingSource = project.contractMeta.fundingSource;
            ledger.meta.lastFinancialAudit = new Date().toISOString();

            writeFileSync(this.r2VaultPath, JSON.stringify(ledger, null, 4), "utf-8");
            console.log(`💾 [R2-Stack] Project context synchronized to workforce ledger state.`);
        } catch (error) {
            console.error("❌ [Finance-Core] Failed to stamp financial data onto ledger file:", error);
        }
    }
}
