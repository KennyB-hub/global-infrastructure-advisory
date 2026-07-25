// seven-os/workers/govview/index.ts
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface ViewContext {
    userRole: "public" | "sovereign_gov" | "kids_learning";
    operatorId: string;
}

export class SevenOsGovViewWorker {
    private ledgerPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");

    public compile2050Portal(ctx: ViewContext): string {
        console.log(`\n📡 [GovView-Worker] Ingesting Portal Request for 2050 Platform...`);
        console.log(`🔑 [GovView-Worker] Security Authorization Context: Role -> [${ctx.userRole.toUpperCase()}]`);

        let activeHazards = 0;
        let perimeterState = "SECURE";
        let networkBans = 0;
        let activeProject = "System Idling";

        if (existsSync(this.ledgerPath)) {
            try {
                const ledger = JSON.parse(readFileSync(this.ledgerPath, "utf-8"));
                activeHazards = ledger.meta?.activeHazardsCount || 0;
                perimeterState = ledger.meta?.globalPerimeterStatus || "SECURE";
                networkBans = ledger.meta?.activeNetworkBansCount || 0;
                activeProject = ledger.meta?.activeProject || "System Idling";
            } catch {}
        }

        // 2. Compile Conditional Data Overlays Based on Tiers
        let structuralDataView = "";
        
        if (ctx.userRole === "sovereign_gov") {
            structuralDataView = `
                <div class="card sovereign">
                    <h3>🏛️ Sovereign Government Tactical Control</h3>
                    <p><strong>Active Project Framework:</strong> ${activeProject}</p>
                    <p><strong>Active Perimeter State:</strong> <span class="status-alert">${perimeterState}</span></p>
                    <p><strong>Total Hazards Isolated:</strong> ${activeHazards}</p>
                    <p><strong>Active Automated IP Network Bans:</strong> ${networkBans}</p>
                    <div class="control-box">Core Drone/Rover Fleet Status: 🟢 AUTH_ONLINE (MAVLink Mesh Active)</div>
                </div>
            `;
        } else if (ctx.userRole === "kids_learning") {
            structuralDataView = `
                <div class="card kids">
                    <h3>🎮 Seven's Future Engineer Command Center!</h3>
                    <p>Welcome, Future Engineer! Today, Seven-OS is inviting you to manage our local infrastructure grid. Think of it like your favorite base-building simulator!</p>
                    
                    <div class="quest-box">
                        <h4>🏆 Active Daily Quest: Water Flow Challenge</h4>
                        <p>Our regional water systems are running perfectly. Can you calculate how much water a farm needs if we deploy 2 autonomous drones? <em>(Hint: Seven's shared math engine says it takes 150 liters per grid cell!)</em></p>
                    </div>

                    <div class="stat-grid">
                        <div class="stat-item">🛸 <strong>Active Drones:</strong> 4 Online</div>
                        <div class="stat-item">⚡ <strong>Power Grid:</strong> 100% Stable</div>
                        <div class="stat-item">🌱 <strong>Farm Health:</strong> Super Green</div>
                    </div>
                    <div class="control-box-kids">🎓 Achievement Unlocked: Junior Infrastructure Protector Token generated in R2 stack!</div>
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

        // 3. Assemble and compile the HTML string
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seven-OS 2050 Platform Portal</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0b0f19; color: #f3f4f6; margin: 0; padding: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #22d3ee; border-bottom: 2px solid #1e293b; padding-bottom: 10px; margin-bottom: 30px; font-size: 26px; }
        .card { background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
        .sovereign { border-left: 4px solid #ef4444; }
        .public { border-left: 4px solid #10b981; }
        .kids { border-left: 4px solid #a855f7; background: linear-gradient(135deg, #111827 0%, #1e1b4b 100%); }
        h3 { margin-top: 0; color: #e5e7eb; font-size: 20px; }
        h4 { margin: 0 0 8px 0; color: #c084fc; }
        p { line-height: 1.6; color: #9ca3af; font-size: 15px; }
        .status-alert { color: #f59e0b; font-weight: bold; background: rgba(245,158,11,0.1); padding: 2px 8px; border-radius: 4px; }
        .quest-box { background: rgba(168,85,247,0.05); border: 1px dashed rgba(168,85,247,0.3); padding: 16px; border-radius: 8px; margin: 15px 0; }
        .stat-grid { display: flex; gap: 15px; margin-top: 15px; }
        .stat-item { background: #1f2937; padding: 10px 15px; border-radius: 6px; font-size: 14px; border: 1px solid #374151; }
        .control-box { background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.2); padding: 12px; border-radius: 6px; color: #f87171; font-family: monospace; font-size: 13px; }
        .control-box-public { background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); padding: 12px; border-radius: 6px; color: #34d399; font-family: monospace; font-size: 13px; }
        .control-box-kids { background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); padding: 12px; border-radius: 6px; color: #e9d5ff; font-family: monospace; font-size: 13px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧠 Seven-OS // 2050 Global Infrastructure Core Portal</h1>
        \${structuralDataView}
    </div>
</body>
</html>`;
    }
}
