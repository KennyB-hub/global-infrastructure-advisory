// seven-os/sector/shared/sector-audit-engine.ts
import { readdirSync, statSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface SectorAuditResult {
    sectorName: string;
    status: "COMPLIANT" | "NON_COMPLIANT";
    activeModulesCount: number;
    violations: string[];
}

export class SevenOsSectorAuditEngine {
    private sectorRootDir = join(process.cwd(), "seven-os", "sector");

    public auditAllSectors(): SectorAuditResult[] {
        console.log("🔍 [Sovereign-Audit] Initializing Full Sector Boundary Compliance Sweep...");
        if (!existsSync(this.sectorRootDir)) return [];

        const sectors = readdirSync(this.sectorRootDir);
        const report: SectorAuditResult[] = [];

        sectors.forEach(sector => {
            const sectorPath = join(this.sectorRootDir, sector);
            if (!statSync(sectorPath).isDirectory()) return;

            const violations: string[] = [];
            const files = readdirSync(sectorPath);

            // Government Boundary Check: Ensure no raw Node configuration modules are leak-exposed
            files.forEach(file => {
                if (file === "package.json" || file === "node_modules") {
                    violations.push(`Security Breach: Legacy Node artifact found inside sovereign sector [${sector}].`);
                }
            });

            report.push({
                sectorName: sector,
                status: violations.length === 0 ? "COMPLIANT" : "NON_COMPLIANT",
                activeModulesCount: files.length,
                violations
            });
        });

        return report;
    }
}