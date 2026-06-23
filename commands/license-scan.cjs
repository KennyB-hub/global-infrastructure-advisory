#!/usr/bin/env node

// Seven‑OS License Scanner (v3/v12)
// Scans repo for license signatures and writes OS‑command‑view report.

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(repoRoot, "reports");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// License signatures to detect
const licenseSignatures = [
  { id: "MIT", re: /MIT License/i },
  { id: "Apache-2.0", re: /Apache License/i },
  { id: "GPL", re: /GNU GENERAL PUBLIC LICENSE/i },
  { id: "BSD", re: /BSD License/i },
  { id: "Proprietary", re: /All rights reserved|Proprietary/i }
];

// Initialize findings
const findings = {};
licenseSignatures.forEach(l => (findings[l.id] = []));

// Recursively walk repo
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const e of entries) {
    const full = path.join(dir, e.name);

    // Skip noisy dirs
    if (e.isDirectory()) {
      if (["node_modules", ".git", "dist"].includes(e.name)) continue;
      walk(full);
      continue;
    }

    // Only scan relevant file types
    if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (![".js", ".ts", ".json", ".md", ".txt", ".css", ".html"].includes(ext)) continue;

      try {
        const content = fs.readFileSync(full, "utf8");
        licenseSignatures.forEach(sig => {
          if (sig.re.test(content)) {
            findings[sig.id].push(
              path.relative(repoRoot, full).replace(/\\/g, "/")
            );
          }
        });
      } catch {}
    }
  }
}

console.log("🔍 Scanning for license signatures...");
walk(repoRoot);

const outPath = path.join(outDir, "license-scan.json");
fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      scannedAt: new Date().toISOString(),
      findings
    },
    null,
    2
  )
);

console.log("✔ License scan complete.");
console.log("📄 Report:", outPath);
process.exit(0);
