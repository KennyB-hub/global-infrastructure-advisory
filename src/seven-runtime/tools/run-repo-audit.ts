import { SevenRepoAudit } from "../audit/seven-repo-audit";
import * as path from "path";

async function main() {
    const rootDir = path.resolve(__dirname, "../../.."); // adjust if needed

    const audit = new SevenRepoAudit({
        rootDir,
        requiredSectors: [
            "cattle",
            "crop",
            "powerline",
            "pipeline",
            "road",
            "bridge",
            "tower"
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
