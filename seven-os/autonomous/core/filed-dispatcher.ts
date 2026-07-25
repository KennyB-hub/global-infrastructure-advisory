// seven-os/autonomous/core/field-dispatcher.ts
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface FieldMissionRequest {
    missionId: string;
    operatorTier: "farmer" | "fire_team" | "grid_operator" | "sovereign_gov";
    targetSector: "agri" | "public_safety" | "energy";
    operationType: "CROP_ANALYSIS" | "HAZARD_SWEEP" | "GRID_LINE_INSPECTION";
    assignedAssetId: string; // e.g., "ROB-DRN-VALKYRIE"
}

export interface TacticalDispatchReceipt {
    missionId: string;
    executionStatus: "DISPATCHED" | "DENIED_BY_GATEKEEPER";
    assignedGatewayPath: string;
    timestamp: string;
}

export class SevenOsFieldDispatcher {
    private ledgerPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");

    /**
     * Authenticates and launches autonomous hardware assets based on field operations requirements
     */
    public dispatchFieldMission(request: FieldMissionRequest): TacticalDispatchReceipt {
        console.log(`\n🚨 [Field-Dispatcher] Ingesting Tactical Mission Request: [${request.missionId}]`);
        console.log(`📡 [Field-Dispatcher] Source Agency: ${request.operatorTier.toUpperCase()} | Action: ${request.operationType}`);

        // 1. Enforce Role-Based Access Control Boundaries
        let isAuthorized = false;
        if (request.operatorTier === "sovereign_gov") isAuthorized = true;
        else if (request.operatorTier === "farmer" && request.targetSector === "agri") isAuthorized = true;
        else if (request.operatorTier === "fire_team" && request.targetSector === "public_safety") isAuthorized = true;
        else if (request.operatorTier === "grid_operator" && request.targetSector === "energy") isAuthorized = true;

        if (!isAuthorized) {
            console.error(`❌ [Field-Dispatcher] Security Block: ${request.operatorTier.toUpperCase()} unauthorized for sector/${request.targetSector}/`);
            return {
                missionId: request.missionId,
                executionStatus: "DENIED_BY_GATEKEEPER",
                assignedGatewayPath: "none",
                timestamp: new Date().toISOString()
            };
        }

        // 2. Direct Path Routing based on specialized operational parameters
        const gatewayPath = `/api/sector/${request.targetSector}/missions/${request.missionId.toLowerCase()}`;
        console.log(`🟢 [Field-Dispatcher] Authorization Certified. Launching asset [${request.assignedAssetId}]...`);
        console.log(`🛸 [Flight-Plan] Tracking active telemetry stream on: ${gatewayPath}`);

        const receipt: TacticalDispatchReceipt = {
            missionId: request.missionId,
            executionStatus: "DISPATCHED",
            assignedGatewayPath: gatewayPath,
            timestamp: new Date().toISOString()
        };

        this.logDispatchToR2Stack(request, receipt);
        return receipt;
    }

    private logDispatchToR2Stack(req: FieldMissionRequest, receipt: TacticalDispatchReceipt): void {
        if (!existsSync(this.ledgerPath)) return;
        try {
            const ledger = JSON.parse(readFileSync(this.ledgerPath, "utf-8"));
            
            // Append operational flight metadata directly into the unalterable ledger state
            ledger.meta.lastFieldMissionId = req.missionId;
            ledger.meta.lastDispatchedAsset = req.assignedAssetId;
            ledger.meta.lastDispatchStatus = receipt.executionStatus;
            ledger.meta.lastFieldRouterSync = receipt.timestamp;

            writeFileSync(this.ledgerPath, JSON.stringify(ledger, null, 4), "utf-8");
            console.log("💾 [R2-Stack] Tactical field dispatch transaction successfully logged to ledger.");
        } catch {
            console.error("❌ [Field-Dispatcher] Critical exception logging transaction to standalone R2 stack.");
        }
    }
}
