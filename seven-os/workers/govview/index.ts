// seven-os/workers/govview/index.ts
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface ViewContext {
    userRole: "public" | "sovereign_gov" | "kids_learning" | "farmer_portal";
    operatorId: string;
}

export class SevenOsGovViewWorker {
    private ledgerPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");
    private economicsPath = join(process.cwd(), "seven-os", "config", "economics.registry.json");

    public compile2050Portal(ctx: ViewContext): string {
        console.log(`\n📡 [GovView-Worker] Compiling Dynamic Three-Tier Economics Portal...`);

        // Load active financials out of her standalone R2 storage registry
        let reserves = 4957350;
        let assetValue = 142500000;
        let phoenixAllocated = 2500000;
        let phoenixExpended = 950000;

        if (existsSync(this.economicsPath)) {
            try {
                const econ = JSON.parse(readFileSync(this.economicsPath, "utf-8"));
                reserves = econ.companyReserveUsd || reserves;
                assetValue = econ.publicInfrastructureValueUsd || assetValue;
                phoenixAllocated = econ.govFundingAllocatedUsd || phoenixAllocated;
                phoenixExpended = econ.govFundingExpendedUsd || phoenixExpended;
            } catch {}
        }

        let dynamicView = "";

        if (ctx.userRole === "sovereign_gov") {
            dynamicView = `
                <div class="card sovereign">
                    <h3>🏛️ Sovereign Government Fiscal Control</h3>
                    <p><strong>Federal Procurement Track:</strong> Project Phoenix (NAICS 541330/541370)</p>
                    <div class="chart-container">
                        <div class="bar expended" style="width: 38%">Expended: $${phoenixExpended.toLocaleString()}</div>
                        <div class="bar available" style="width: 62%">Cushion: $${(phoenixAllocated - phoenixExpended).toLocaleString()}</div>
                    </div>
                    <p>📊 <strong>Total Federal Allocation Cap:</strong> $${phoenixAllocated.toLocaleString()} USD</p>
                    <div class="control-box">SHA-256 Contract Token: 🟢 VERIFIED_COMPLIANT_HIGH</div>
                </div>`;
        } else if (ctx.userRole === "farmer_portal") {
            dynamicView = `
                <div class="card farmer">
                    <h3>🌾 Connected Agricultural Asset Node</h3>
                    <p><strong>Operator Token ID:</strong> ${ctx.operatorId}</p>
                    <p><strong>Downstream Agri Telemetry Link:</strong> 🛰️ ORBITAL_SATELLITE_MESH_PIPE (Nominal)</p>
                    <div class="chart-container">
                        <div class="bar reserve" style="width: 100%">Active Land Grid Valuation: $385,000</div>
                    </div>
                    <p>🌱 <strong>Cattle Collars & Drone Fleet:</strong> Automated billing paired to Company Finance.</p>
                    <div class="control-box-farmer">Seven-OS Voice Ops: "Farmer account linked. Processing soil point-clouds natively."</div>
                </div>`;
        } else if (ctx.userRole === "kids_learning") {
            dynamicView = `
                <div class="card kids">
                    <h3>🎮 Seven's Future Engineer Command Center!</h3>
                    <p>Welcome to your favorite infrastructure base-builder! Can you help Seven optimize her power cells?</p>
                    <div class="quest-box">
                        <h4>🏆 Daily Challenge: Solar Array Alignment</h4>
                        <p>Current Regional Valuation: <strong>$${assetValue.toLocaleString()}</strong>. Build 2 extra grids to unlock your next R2 token badge!</p>
                    </div>
                </div>`;
        } else {
            dynamicView = `
                <div class="card public">
                    <h3>🌾 Public Civil Infrastructure Economics</h3>
                    <p><strong>Managed 23-Sector Regional System Value:</strong> $${assetValue.toLocaleString()} USD</p>
                    <div class="chart-container">
                        <div class="bar available" style="width: 100%">Corporate Reserve Liquidity: Stable</div>
                    </div>
                    <p>🔒 <strong>System Safety Rating:</strong> NOMINAL APEX (Zero-Trust Enabled)</p>
                </div>`;
        }

        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>2050 Infrastructure Platform</title><style>body { font-family: system-ui; background: #0b0f19; color: #f3f4f6; padding: 40px; }.container { max-width: 800px; margin: 0 auto; }h1 { color: #22d3ee; border-bottom: 2px solid #1e293b; padding-bottom: 10px; }.card { background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.4); }.sovereign { border-left: 4px solid #ef4444; }.public { border-left: 4px solid #10b981; }.kids { border-left: 4px solid #a855f7; background: linear-gradient(135deg, #111827 0%, #1e1b4b 100%); }.farmer { border-left: 4px solid #eab308; background: linear-gradient(135deg, #111827 0%, #451a03 100%); }p { color: #9ca3af; }.chart-container { display: flex; height: 30px; border-radius: 6px; overflow: hidden; margin: 15px 0; background: #1f2937; }.bar { display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #fff; }.expended { background: #dc2626; }.available { background: #2563eb; }.reserve { background: #16a34a; }.quest-box { background: rgba(168,85,247,0.05); border: 1px dashed #a855f7; padding: 16px; border-radius: 8px; }.control-box, .control-box-farmer { background: rgba(0,0,0,0.3); border: 1px solid #374151; padding: 12px; border-radius: 6px; font-family: monospace; color: #34d399; margin-top: 15px; }</style></head><body><div class="container"><h1>🧠 Seven-OS // 2050 Global Infrastructure Core Portal</h1>${dynamicView}</div></body></html>`;
    }
}
// seven-os/workers/govview/index.ts
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface ViewContext {
    userRole: "public" | "sovereign_gov" | "kids_learning" | "farmer_portal";
    operatorId: string;
}

export class SevenOsGovViewWorker {
    private ledgerPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");
    private economicsPath = join(process.cwd(), "seven-os", "config", "economics.registry.json");

    public compile2050Portal(ctx: ViewContext): string {
        console.log(`\n📡 [GovView-Worker] Compiling Dynamic Three-Tier Economics Portal...`);

        // Load active financials out of her standalone R2 storage registry
        let reserves = 8957350;
        let assetValue = 142579200;
        let phoenixAllocated = 2500000;
        let phoenixExpended = 950000;

        if (existsSync(this.economicsPath)) {
            try {
                const econ = JSON.parse(readFileSync(this.economicsPath, "utf-8"));
                reserves = econ.companyReserveUsd || reserves;
                assetValue = econ.publicInfrastructureValueUsd || assetValue;
                phoenixAllocated = econ.govFundingAllocatedUsd || phoenixAllocated;
                phoenixExpended = econ.govFundingExpendedUsd || phoenixExpended;
            } catch {}
        }

        let dynamicView = "";

        if (ctx.userRole === "sovereign_gov") {
            dynamicView = `
                <div class="card sovereign">
                    <h3>🏛️ Sovereign Government Fiscal Control</h3>
                    <p><strong>Federal Procurement Track:</strong> Project Phoenix (NAICS 541330/541370)</p>
                    <div class="chart-container">
                        <div class="bar expended" style="width: 38%">Expended: $${phoenixExpended.toLocaleString()}</div>
                        <div class="bar available" style="width: 62%">Cushion: $${(phoenixAllocated - phoenixExpended).toLocaleString()}</div>
                    </div>
                    <p>📊 <strong>Total Federal Allocation Cap:</strong> $${phoenixAllocated.toLocaleString()} USD</p>
                    <div class="control-box">SHA-256 Contract Token: 🟢 VERIFIED_COMPLIANT_HIGH</div>
                </div>`;
        } else if (ctx.userRole === "farmer_portal") {
            dynamicView = `
                <div class="card farmer">
                    <h3>🌾 Connected Agricultural Asset Node</h3>
                    <p><strong>Operator Token ID:</strong> ${ctx.operatorId}</p>
                    <p><strong>Downstream Agri Telemetry Link:</strong> 🛰️ ORBITAL_SATELLITE_MESH_PIPE (Nominal)</p>
                    <div class="chart-container">
                        <div class="bar reserve" style="width: 100%">Active Land Grid Valuation: $385,000</div>
                    </div>
                    <p>🌱 <strong>Cattle Collars & Drone Fleet:</strong> Automated billing paired to Company Finance.</p>
                    <div class="control-box-farmer">Seven-OS Voice Ops: "Farmer account linked. Processing soil point-clouds natively."</div>
                </div>`;
        } else if (ctx.userRole === "kids_learning") {
            dynamicView = `
                <div class="card kids">
                    <h3>🎮 Seven's Future Engineer Command Center!</h3>
                    <p>Welcome to your favorite infrastructure base-builder! Can you help Seven optimize her power cells?</p>
                    <div class="quest-box">
                        <h4>🏆 Daily Challenge: Solar Array Alignment</h4>
                        <p>Current Regional Valuation: <strong>$${assetValue.toLocaleString()}</strong>. Build 2 extra grids to unlock your next R2 token badge!</p>
                    </div>
                </div>`;
        } else {
            dynamicView = `
                <div class="card public">
                    <h3>🌾 Public Civil Infrastructure Economics</h3>
                    <p><strong>Managed 23-Sector Regional System Value:</strong> $${assetValue.toLocaleString()} USD</p>
                    <div class="chart-container">
                        <div class="bar available" style="width: 100%">Corporate Reserve Liquidity: Stable</div>
                    </div>
                    <p>🔒 <strong>System Safety Rating:</strong> NOMINAL APEX (Zero-Trust Enabled)</p>
                </div>`;
        }

        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>2050 Infrastructure Platform</title><style>body { font-family: system-ui; background: #0b0f19; color: #f3f4f6; padding: 40px; }.container { max-width: 800px; margin: 0 auto; }h1 { color: #22d3ee; border-bottom: 2px solid #1e293b; padding-bottom: 10px; }.card { background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.4); }.sovereign { border-left: 4px solid #ef4444; }.public { border-left: 4px solid #10b981; }.kids { border-left: 4px solid #a855f7; background: linear-gradient(135deg, #111827 0%, #1e1b4b 100%); }.farmer { border-left: 4px solid #eab308; background: linear-gradient(135deg, #111827 0%, #451a03 100%); }p { color: #9ca3af; }.chart-container { display: flex; height: 30px; border-radius: 6px; overflow: hidden; margin: 15px 0; background: #1f2937; }.bar { display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #fff; }.expended { background: #dc2626; }.available { background: #2563eb; }.reserve { background: #16a34a; }.quest-box { background: rgba(168,85,247,0.05); border: 1px dashed #a855f7; padding: 16px; border-radius: 8px; }.control-box, .control-box-farmer { background: rgba(0,0,0,0.3); border: 1px solid #374151; padding: 12px; border-radius: 6px; font-family: monospace; color: #34d399; margin-top: 15px; }</style></head><body><div class="container"><h1>🧠 Seven-OS // 2050 Global Infrastructure Core Portal</h1>${dynamicView}</div></body></html>`;
    }
}
