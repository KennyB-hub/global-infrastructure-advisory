// © 2026 Global Infrastructure Advisory
// Seven Runtime — SevenRepoAudit Engine

import * as fs from "fs";
import * as path from "path";

export interface SevenRepoIssue {
    type: "MISSING_FILE" | "BROKEN_IMPORT" | "INVALID_JSON" | "ORPHAN_MODULE" | "SECTOR_MISSING" | "GENERAL";
    file?: string;
    detail: string;
}

export interface SevenRepoAuditResult {
    ok: boolean;
    issues: SevenRepoIssue[];
    scannedFiles: number;
}

export interface SevenRepoAuditConfig {
    rootDir: string;              // repo root
    runtimeDir?: string;          // e.g. "seven-runtime"
    sectorsDir?: string;          // e.g. "seven-runtime/sectors"
    requiredSectors?: string[];   // e.g. ["cattle", "crop", "powerline", "pipeline", "road", "bridge", "tower"];
}

export class SevenRepoAudit {
    private config: SevenRepoAuditConfig;

    constructor(config: SevenRepoAuditConfig) {
        this.config = {
            runtimeDir: "seven-runtime",
            sectorsDir: "seven-runtime/sectors",
            requiredSectors: [],
            ...config
        };
    }

    async run(): Promise<SevenRepoAuditResult> {
        const issues: SevenRepoIssue[] = [];
        let scannedFiles = 0;

        const root = this.config.rootDir;

        // 1. Scan all TS/JS/JSON files under runtime
        const runtimePath = path.join(root, this.config.runtimeDir!);
        const files = this.walk(runtimePath);

        for (const file of files) {
            scannedFiles++;

            if (file.endsWith(".json")) {
                this.checkJson(file, issues);
            }

            if (file.endsWith(".ts") || file.endsWith(".js")) {
                this.checkImports(file, issues);
            }
        }

        // 2. Check required sectors exist
        this.checkSectors(root, issues);

        return {
            ok: issues.length === 0,
            issues,
            scannedFiles
        };
    }

    // -----------------------------
    // Walk directory tree
    // -----------------------------
    private walk(dir: string): string[] {
        let results: string[] = [];
        if (!fs.existsSync(dir)) return results;

        const list = fs.readdirSync(dir);
        for (const file of list) {
            const full = path.join(dir, file);
            const stat = fs.statSync(full);
            if (stat && stat.isDirectory()) {
                results = results.concat(this.walk(full));
            } else {
                results.push(full);
            }
        }
        return results;
    }

    // -----------------------------
    // JSON validation
    // -----------------------------
    private checkJson(file: string, issues: SevenRepoIssue[]) {
        try {
            const content = fs.readFileSync(file, "utf8");
            JSON.parse(content);
        } catch (err: any) {
            issues.push({
                type: "INVALID_JSON",
                file,
                detail: `Invalid JSON: ${err.message}`
            });
        }
    }

    // -----------------------------
    // Import path sanity check
    // -----------------------------
    private checkImports(file: string, issues: SevenRepoIssue[]) {
        const content = fs.readFileSync(file, "utf8");
        const importRegex = /from\s+["'](.+?)["'];?/g;
        let match: RegExpExecArray | null;

        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];

            // Only check relative imports
            if (!importPath.startsWith(".")) continue;

            const resolved = this.resolveImport(file, importPath);
            if (!resolved) {
                issues.push({
                    type: "BROKEN_IMPORT",
                    file,
                    detail: `Broken import: "${importPath}"`
                });
            }
        }
    }

    private resolveImport(fromFile: string, importPath: string): string | null {
        const baseDir = path.dirname(fromFile);
        const fullBase = path.resolve(baseDir, importPath);

        const candidates = [
            fullBase + ".ts",
            fullBase + ".js",
            fullBase + ".json",
            path.join(fullBase, "index.ts"),
            path.join(fullBase, "index.js")
        ];

        for (const c of candidates) {
            if (fs.existsSync(c)) return c;
        }
        return null;
    }

    // -----------------------------
    // Sector presence check
    // -----------------------------
    private checkSectors(root: string, issues: SevenRepoIssue[]) {
        const sectorsDir = path.join(root, this.config.sectorsDir!);
        const required = this.config.requiredSectors || [];

        for (const sector of required) {
            const sectorFileTs = path.join(sectorsDir, `${sector}-sector.ts`);
            const sectorFileJs = path.join(sectorsDir, `${sector}-sector.js`);

            if (!fs.existsSync(sectorFileTs) && !fs.existsSync(sectorFileJs)) {
                issues.push({
                    type: "SECTOR_MISSING",
                    file: sectorsDir,
                    detail: `Missing sector module for "${sector}"`
                });
            }
        }
    }
}
