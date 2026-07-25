// seven-os/sector/space/isru-fuel-cell.ts
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface IceTelemetryPayload {
    sourceId: string; // e.g., "LUNAR-CRATER-SHACKLETON" or "ASTEROID-METIS-4"
    rawIceMassKg: number;
    contaminationPercentage: number; // Particulate, ammonia, sulfur compounds, etc.
    thermalCoreTempK: number;
}

export interface FuelCellOutput {
    pureWaterExtractedKg: number;
    liquidOxygenYieldKg: number;
    liquidHydrogenYieldKg: number;
    fuelGrade: "MIL-SPEC-SPACE" | "COMMERCIAL" | "UNUSABLE";
    systemEfficiency: number;
}

export class SevenOsSpaceFuelCell {
    private r2AuditPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");

    /**
     * Processes space ice contamination metrics and calculates dual-propellant fuel cell yields
     */
    public processIceRefiningMatrix(telemetry: IceTelemetryPayload): FuelCellOutput {
        console.log(`\n🛸 [Space-ISRU] Initiating Ice Refining Sequence for Resource Source: [${telemetry.sourceId}]`);
        console.log(`❄️ [Space-ISRU] Ingested Raw Ice Volumetrics: ${telemetry.rawIceMassKg} kg`);

        // 1. Calculate Contamination Loss
        const pureWaterExtractedKg = telemetry.rawIceMassKg * (1 - (telemetry.contaminationPercentage / 100));
        console.log(`💧 [Space-ISRU] Scrubbing Complete: Extracted ${pureWaterExtractedKg.toFixed(2)} kg of pure H2O.`);

        // 2. Execute Electrolysis Splitting Logic (Molar mass ratio: ~88.8% Oxygen, ~11.1% Hydrogen)
        const liquidOxygenYieldKg = pureWaterExtractedKg * 0.888;
        const liquidHydrogenYieldKg = pureWaterExtractedKg * 0.111;

        // 3. Determine Fuel Grade via contamination tolerances
        let fuelGrade: "MIL-SPEC-SPACE" | "COMMERCIAL" | "UNUSABLE" = "MIL-SPEC-SPACE";
        if (telemetry.contaminationPercentage > 15) fuelGrade = "COMMERCIAL";
        if (telemetry.contaminationPercentage > 45) fuelGrade = "UNUSABLE";

        const output: FuelCellOutput = {
            pureWaterExtractedKg,
            liquidOxygenYieldKg,
            liquidHydrogenYieldKg,
            fuelGrade,
            systemEfficiency: telemetry.thermalCoreTempK > 373 ? 0.96 : 0.85 // High core temp optimizes yield metrics
        };

        console.log(`🚀 [Space-ISRU] Electrolysis Complete | Grade: ${output.fuelGrade}`);
        console.log(`   ⛽ Yield 1 (Oxidizer): +${output.liquidOxygenYieldKg.toFixed(2)} kg LOX`);
        console.log(`   Gas Yield 2 (Propellant): +${output.liquidHydrogenYieldKg.toFixed(2)} kg LH2`);

        this.syncFuelTelemetryToR2(telemetry.sourceId, output);
        return output;
    }

    private syncFuelTelemetryToR2(sourceId: string, output: FuelCellOutput): void {
        if (!existsSync(this.r2AuditPath)) return;
        try {
            const ledger = JSON.parse(readFileSync(this.r2AuditPath, "utf-8"));
            
            // Log deep space asset harvesting states natively
            ledger.meta.deepSpaceHarvestSource = sourceId;
            ledger.meta.activeFuelGrade = output.fuelGrade;
            ledger.meta.lastIsruSync = new Date().toISOString();

            writeFileSync(this.r2AuditPath, JSON.stringify(ledger, null, 4), "utf-8");
            console.log("💾 [R2-Stack] Space fuel logistics matrix successfully cached to workforce ledger.");
        } catch {
            console.error("❌ [Space-ISRU] Critical ledger update dropped during orbital processing.");
        }
    }
}
