import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export class SevenOsSpaceFlightPathMatrix {
    private ledgerPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");

    public calculateInterplanetaryTrajectory(originVelocity: number, target: any, shipDryMassKg: number): any {
        console.log(`\n🌌 [Space-Navigation] Plotting Orbital Trajectory to Target: [${target.name.toUpperCase()}]`);
        
        const requiredDeltaVMs = Math.abs(target.currentVelocityKms - originVelocity) * 1000;
        const massRatio = Math.exp(requiredDeltaVMs / (450 * 9.81));
        const estimatedFuelBurnKg = (shipDryMassKg * massRatio) - shipDryMassKg;

        const plan = {
            planId: `FLT-PLN-${Math.floor(Math.random() * 100000)}`,
            targetName: target.name,
            requiredDeltaVMs,
            estimatedFuelBurnKg,
            launchWindowOpen: new Date(Date.now() + 259200000).toISOString()
        };

        this.cacheFlightPlanToLedger(plan);
        return plan;
    }

    private cacheFlightPlanToLedger(plan: any): void {
        if (!existsSync(this.ledgerPath)) return;
        try {
            const ledger = JSON.parse(readFileSync(this.ledgerPath, "utf-8"));
            ledger.meta.activeSpaceTrajectory = plan.planId;
            ledger.meta.targetDestination = plan.targetName;
            writeFileSync(this.ledgerPath, JSON.stringify(ledger, null, 4), "utf-8");
            console.log("💾 [R2-Stack] Orbital trajectory flight plan successfully cached to workforce ledger.");
        } catch {}
    }
}
