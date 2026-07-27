import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export class SevenOsSatcomMeshController {
    private ledgerPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");

    public routeTelemetryStream(health: any, data: any): string {
        console.log(`\n📡 [Satcom-Mesh] Evaluating connection matrix status for: [${data.assetId}]`);
 const terrestrialFailed = health.lteSignalStrengthDbm < -110 && !health.wifiConnected && !health.fiveGActive;
        const linkChannel = terrestrialFailed ? "ORBITAL_SATELLITE_MESH_PIPE" : "TERRESTRIAL_CELLULAR_5G";

        if (terrestrialFailed) {
            console.log("🚨 [Satcom-Mesh] WARNING: LTE/WiFi/5G down! Deploying Direct Satcom Link...");
        }

        console.log(`🚚 [Satcom-Mesh] Stream active -> sector/${data.sectorDomain}/ [${data.dataType.toUpperCase()}]`);
        this.logSatcomStateToR2(data.assetId, linkChannel);
        return linkChannel;
    }

    private logSatcomStateToR2(assetId: string, link: string): void {
        if (!existsSync(this.ledgerPath)) return;
        try {
            const ledger = JSON.parse(readFileSync(this.ledgerPath, "utf-8"));
            ledger.meta.lastAuditedCommsAsset = assetId;
            ledger.meta.activeCommsLinkChannel = link;
            ledger.meta.lastSatcomMeshSync = new Date().toISOString();
            writeFileSync(this.ledgerPath, JSON.stringify(ledger, null, 4), "utf-8");
            console.log("💾 [R2-Stack] Satcom mesh status token cached to workforce ledger.");
        } catch {}
    }
}
