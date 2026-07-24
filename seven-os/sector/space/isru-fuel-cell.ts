import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export class SevenOsSpaceFuelCell {
    private r2AuditPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");

    public processIceRefiningMatrix(telemetry: any): any {
        console.log(`\n🛸 [Space-ISRU] Initiating Ice Refining Sequence for Resource Source: [${telemetry.sourceId}]`);
        
        const pureWaterExtractedKg = telemetry.rawIceMassKg * (1 - (telemetry.contaminationPercentage / 100));
        const liquidOxygenYieldKg = pureWaterExtractedKg * 0.888;
        const liquidHydrogenYieldKg = pureWaterExtractedKg * 0.111;

        console.log(`🚀 [Space-ISRU] Electrolysis Complete | Scrubbed Pure H2O: ${pureWaterExtractedKg.toFixed(2)} kg`);
        console.log(`   ⛽ Yield 1 (Oxidizer): +${liquidOxygenYieldKg.toFixed(2)} kg LOX`);
        console.log(`   ⛽ Yield 2 (Propellant): +${liquidHydrogenYieldKg.toFixed(2)} kg LH2`);

        this.syncFuelTelemetryToR2(telemetry.sourceId);
        return { pureWaterExtractedKg, liquidOxygenYieldKg, liquidHydrogenYieldKg };
    }

    private syncFuelTelemetryToR2(sourceId: string): void {
        if (!existsSync(this.r2AuditPath)) return;
        try {
            const ledger = JSON.parse(readFileSync(this.r2AuditPath, "utf-8"));
            ledger.meta.deepSpaceHarvestSource = sourceId;
            ledger.meta.lastIsruSync = new Date().toISOString();
            writeFileSync(this.r2AuditPath, JSON.stringify(ledger, null, 4), "utf-8");
            console.log("💾 [R2-Stack] Space fuel logistics matrix cached to workforce ledger.");
        } catch {}
    }
}
