import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export class SevenOsFieldDispatcher {
    private ledgerPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");

    public dispatchFieldMission(request: any): any {
        console.log(`\n🚨 [Field-Dispatcher] Ingesting Tactical Mission Request: [${request.missionId}]`);
        console.log(`📡 [Field-Dispatcher] Agency: ${request.operatorTier.toUpperCase()} | Action: ${request.operationType}`);

        let isAuthorized = request.operatorTier === "sovereign_gov" || 
            (request.operatorTier === "farmer" && request.targetSector === "agri") ||
            (request.operatorTier === "fire_team" && request.targetSector === "public_safety") ||
            (request.operatorTier === "grid_operator" && request.targetSector === "energy");

        if (!isAuthorized) {
            console.error(`❌ [Field-Dispatcher] Security Block: Authorization Denied!`);
            return { missionId: request.missionId, executionStatus: "DENIED_BY_GATEKEEPER" };
        }

        const gatewayPath = `/api/sector/${request.targetSector}/missions/${request.missionId.toLowerCase()}`;
        console.log(`🟢 [Field-Dispatcher] Authorization Certified. Launching asset [${request.assignedAssetId}]...`);

        const receipt = {
            missionId: request.missionId,
            executionStatus: "DISPATCHED",
            assignedGatewayPath: gatewayPath,
            timestamp: new Date().toISOString()
        };

        this.logDispatchToR2Stack(request, receipt);
        return receipt;
    }

    private logDispatchToR2Stack(req: any, receipt: any): void {
        if (!existsSync(this.ledgerPath)) return;
        try {
            const ledger = JSON.parse(readFileSync(this.ledgerPath, "utf-8"));
            ledger.meta.lastFieldMissionId = req.missionId;
            ledger.meta.lastDispatchedAsset = req.assignedAssetId;
            ledger.meta.lastDispatchStatus = receipt.executionStatus;
            ledger.meta.lastFieldRouterSync = receipt.timestamp;
            writeFileSync(this.ledgerPath, JSON.stringify(ledger, null, 4), "utf-8");
            console.log("💾 [R2-Stack] Tactical field dispatch transaction logged to ledger.");
        } catch {}
    }
}
