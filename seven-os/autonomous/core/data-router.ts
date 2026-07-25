// seven-os/autonomous/core/data-router.ts
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

export interface SystemDataPackage {
    transactionId: string;
    originSource: string; // e.g., "VALKYRIE-DRONE", "VANGUARD-ROVER", "PHOENIX-FINANCE"
    targetSectorDomain: "agriculture" | "space" | "cyber" | "finance" | "logistics" | string;
    payloadType: "point_cloud_cad" | "isru_refinement" | "budget_allocation" | "cyber_alert";
    dataPayload: any;
}

export class SevenOsDataRouter {
    private sectorBaseDir = join(process.cwd(), "seven-os", "sector");
    private sharedBufferDir = join(process.cwd(), "seven-os", "sector", "shared", "maps");
    private mainLedgerPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");

    /**
     * Ingests, parses, and dynamically routes incoming corporate or government data payloads
     */
    public ingestAndRouteData(packet: SystemDataPackage): boolean {
        console.log(`\n📡 [Data-Router] Intercepted incoming payload: [${packet.transactionId}] from [${packet.originSource}]`);
        console.log(`⚡ [Data-Router] Destination Domain Match: sector/${packet.targetSectorDomain}/`);

        // 1. Determine target directory folder destination based on structural sector mapping rules
        const targetFolder = join(this.sectorBaseDir, packet.targetSectorDomain);
        if (!existsSync(targetFolder)) {
            console.log(`📁 [Data-Router] Standing up missing destination infrastructure path: sector/${packet.targetSectorDomain}`);
            mkdirSync(targetFolder, { recursive: true });
        }

        // 2. Generate clean production file names from metadata signatures
        const outputFilename = `${packet.payloadType}-${packet.transactionId}.json`;
        const finalWritePath = join(targetFolder, outputFilename);

        // 3. Dynamic payload processing actions based on incoming data types
        try {
            // Ensure target directory exists for map buffers if needed
            if (packet.payloadType === "point_cloud_cad" && !existsSync(this.sharedBufferDir)) {
                mkdirSync(this.sharedBufferDir, { recursive: true });
            }

            writeFileSync(finalWritePath, JSON.stringify(packet.dataPayload, null, 4), "utf-8");
            console.log(`💾 [Data-Router] Natively dispatched and locked raw data segment into: sector/${packet.targetSectorDomain}/${outputFilename}`);

            this.logRoutingTransactionToR2(packet.transactionId, packet.targetSectorDomain);
            return true;
        } catch (error) {
            console.error(`❌ [Data-Router] Critical failure routing transaction payload [${packet.transactionId}]:`, error);
            return false;
        }
    }

    private logRoutingTransactionToR2(txId: string, sector: string): void {
        if (!existsSync(this.mainLedgerPath)) return;
        try {
            const ledger = JSON.parse(readFileSync(this.mainLedgerPath, "utf-8"));
            
            // Log active routing operations directly onto her central unalterable tracking ledger
            ledger.meta.lastRoutedTransactionId = txId;
            ledger.meta.lastActiveSectorRoute = sector;
            ledger.meta.lastDataRouterSync = new Date().toISOString();

            writeFileSync(this.mainLedgerPath, JSON.stringify(ledger, null, 4), "utf-8");
            console.log("💾 [R2-Stack] Data router tracking matrix synchronized to workforce ledger.");
        } catch {
            console.error("❌ [Data-Router] Failed to push processing metrics to standalone storage stack.");
        }
    }
}
