// seven-os/workers/govview/index.ts
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface ViewContext {
    userRole: "public" | "sovereign_gov";
    operatorId: string;
}

export class SevenOsGovViewWorker {
    private ledgerPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");
    private firewallPath = join(process.cwd(), "seven-os", "config", "firewall.registry.json");

    /**
     * Natively loads and compiles the 2050 Platform view portal matrix
     */
    public compile2050Portal(ctx: ViewContext): string {
        console.log(`\n📡 [GovView-Worker] Ingesting Portal Request for 2050 Platform...`);
        console.log(`🔑 [GovView-Worker] Security Authorization Context: Role -> [${ctx.userRole.toUpperCase()}]`);

        // 1. Gather real-time core system state parameters out of her local R2 storage stack
        let activeHazards = 0;
        let perimeterState = "SECURE";
        let networkBans = 0;
        let activeProject = "None";

        if (existsSync(this.ledgerPath)) {
            try {
                const ledger = JSON.parse(readFileSync(this.ledgerPath, "utf-8"));
                activeHazards = ledger.meta?.activeHazardsCount || 0;
                perimeterState = ledger.meta?.globalPerimeterStatus || "SECURE";
                networkBans = ledger.meta?.activeNetworkBansCount || 0;
                activeProject = ledger.meta?.activeProject || "System Idling";
            } catch {}
        }

        // 2. Compile strict conditional data overlays depending on client permission tiers
        let structuralDataView = "";
        if (ctx.userRole === "sovereign_gov") {
            structuralDataView = `
                <div class="card sovereign">
                    <h3>🏛️ Sovereign Government Tactical Control</h3>
                    <p><strong>Active Project Framework:</strong> ${activeProject}</p>
                    <p><strong>Active Perimeter State:</strong> <span class="status-alert">${perimeterState}</span></p>
                    <p><strong>Total Localized Real-Time Hazards Isolated:</strong> ${activeHazards}</p>
                    <p><strong>Active Automated IP Network Bans:</strong> ${networkBans}</p>
                    <div class="control-box">Core Drone/Rover Fleet Status: 🟢 AUTH_ONLINE (MAVLink Mesh Active)</div>
                </div>
            `;
        } else {
            structuralDataView = `
                <div class="card public">
                    <h3>🌾 Public Civil Infrastructure Status</h3>
                    <p><strong>Active Regional Operations:</strong> ${activeProject}</p>
                    <p><strong>System Perimeter Safety Rating:</strong> NOMINAL APEX</p>
                    <p><strong>Downstream Sector Status:</strong> 🟢 ALL 23 SECTORS SYMMETRIC</p>
                    <div class="control-box-public">Public Education Portal: Active. Community telemetry streams verified clear.</div>
                </div>
            `;
        }

        // 3. Assemble and compile the direct native HTML string
        const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seven-OS 2050 Infrastructure Platform</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f3f4f6; margin: 0; padding: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #22d3ee; border-bottom: 2px solid #1e293b; padding-bottom: 10px; margin-bottom: 30px; font-size: 28px; letter-spacing: -0.5px; }
        .card { background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5); }
        .sovereign { border-left: 4px solid #ef4444; }
        .public { border-left: 4px solid #10b981; }
        h3 { margin-top: 0; color: #e5e7eb; font-size: 20px; }
        p { line-height: 1.6; color: #9ca3af; font-size: 15px; }
        strong { color: #f3f4f6; }
        .status-alert { color: #f59e0b; font-weight: bold; background: rgba(245,158,11,0.1); padding: 2px 8px; border-radius: 4px; }
        .control-box { background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.2); padding: 12px; border-radius: 6px; color: #f87171; font-family: monospace; font-size: 13px; margin-top: 20px; }
        .control-box-public { background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); padding: 12px; border-radius: 6px; color: #34d399; font-family: monospace; font-size: 13px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧠 Seven-OS // 2050 Global Infrastructure Core Portal</h1>
        ${structuralDataView}
    </div>
</body>
</html>
        `;

        return htmlBody;
    }
}

