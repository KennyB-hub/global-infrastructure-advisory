import { SevenOsAudit } from "../audit/seven-os-audit";
import * as path from "path";

async function main() {
    const rootDir = path.resolve(__dirname, "../../.."); // adjust if needed

    const audit = new SevenOsAudit({
        rootDir,
        requiredSectors: [
            "cattle",
            "crop",
            "powerline",
            "pipeline",
            "road",
            "bridge",
            "tower",
            "building",
            "vehicle",
            "waterway",
            "railway",
            "aeroway",
            "landuse",
            "natural",
            "amenity",
            "shop",
            "tourism",
            "man_made",
            "boundary",
            "place",
            "public_transport",
            "historic",
            "military",
            "office",
            "emergency",
            "healthcare",
            "sport",
            "telecom",
            "infrastructure",
            "geological",
            "power",
            "water"
        ]
    });

    const result = await audit.run();

    console.log("SevenRepoAudit result:");
    console.log(`  OK: ${result.ok}`);
    console.log(`  Scanned files: ${result.scannedFiles}`);
    console.log("  Issues:");
    for (const issue of result.issues) {
        console.log(`   - [${issue.type}] ${issue.file ?? ""} :: ${issue.detail}`);
    }

    process.exit(result.ok ? 0 : 1);
}

main().catch(err => {
    console.error("SevenRepoAudit failed:", err);
    process.exit(1);
});
