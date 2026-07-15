// Seven‑OS Repo Scan Auto‑Fix (Safe Mode)
// - Fixes old src/ references in loaders
// - Logs missing targets
// - Logs malformed JSON
// - Does NOT delete or move files automatically

const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.cwd(), "seven-os");

const loaderPatterns = [
  "loader.js",
  "load.js",
  "manifest-loader.js",
  "engine-loader.js",
  "runtime-loader.js",
  "autonomous-loader.js",
  "policy-loader.js"
];

const report = {
  fixedSrcReferences: [],
  missingTargets: [],
  malformedJson: []
};

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      scanDirectory(full);
      continue;
    }

    // Loader auto-fix
    if (loaderPatterns.some(p => file.includes(p))) {
      let content = fs.readFileSync(full, "utf8");
      const relative = full.replace(ROOT, "");

      if (content.includes("src/")) {
        const fixed = content.replace(/["']src\//g, "\"seven-os/");
        if (fixed !== content) {
          fs.writeFileSync(full, fixed, "utf8");
          report.fixedSrcReferences.push(relative);
        }
        content = fixed;
      }

      const requireMatches = [...content.matchAll(/require\(['"](.+?)['"]\)/g)];
      const importMatches = [...content.matchAll(/from ['"](.+?)['"]/g)];

      const pathsToCheck = [
        ...requireMatches.map(m => m[1]),
        ...importMatches.map(m => m[1])
      ];

      for (const p of pathsToCheck) {
        // ignore node core modules
        if (!p.startsWith(".") && !p.startsWith("/")) continue;

        const resolved = path.resolve(path.dirname(full), p);
        if (!fs.existsSync(resolved)) {
          report.missingTargets.push({
            loader: relative,
            missing: p
          });
        }
      }
    }

    // Malformed JSON detection
    if (file.endsWith(".json")) {
      try {
        JSON.parse(fs.readFileSync(full, "utf8"));
      } catch (err) {
        report.malformedJson.push(full.replace(ROOT, ""));
      }
    }
  }
}

scanDirectory(ROOT);

console.log("===== Seven‑OS Repo Auto‑Fix Report (Safe Mode) =====");
console.log(JSON.stringify(report, null, 2));
