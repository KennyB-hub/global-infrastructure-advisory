import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

export class MainInfrastructureBrain {
    private sectorRootDir = join(process.cwd(), "seven-os", "sector");

    public initializeBrain(): void {
        console.log("🧠 [Sector-Brain] Initializing Main Infrastructure Core...");
        const sectors = this.discoverActiveSectors();
        console.log(`📡 [Sector-Brain] System Brain successfully mapped ${sectors.length} downstream sectors:`);
        sectors.forEach(sec => {
            console.log(`   ⚡ Sector: [${sec.sectorName.toUpperCase()}] | Status: ${sec.status.toUpperCase()} | Sub-Modules: ${sec.moduleCount}`);
        });
    }

    public discoverActiveSectors(): any[] {
        if (!existsSync(this.sectorRootDir)) return [];
        try {
            return readdirSync(this.sectorRootDir)
                .map(file => {
                    const fullPath = join(this.sectorRootDir, file);
                    if (statSync(fullPath).isDirectory()) {
                        return {
                            sectorName: file,
                            status: "active",
                            moduleCount: readdirSync(fullPath).filter(f => f.match(/\.(ts|js|json)$/)).length
                        };
                    }
                    return null;
                })
                .filter(Boolean);
        } catch { return []; }
    }
}

const infrastructureBrain = new MainInfrastructureBrain();
infrastructureBrain.initializeBrain();
