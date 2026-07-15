// Seven‑OS Repo Scan Script (Sovereign Edition)
// Scans entire seven-os/ tree for misplaced loaders, broken imports,
// missing manifests, wrong engine paths, and old src/ references.

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
  misplacedLoaders: [],
  oldSrcReferences: [],
  missingTargets: [],
  duplicateLoaders: [],
  malformedJson: [],
  summary: {}
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

    // Detect loader files
    if (loaderPatterns.some(p => file.includes(p))) {
      const relative = full.replace(ROOT, "");
      report.misplacedLoaders.push(relative);

      // Check for old src/ references
      const content = fs.readFileSync(full, "utf8");
      if (content.includes("src/")) {
        report.oldSrcReferences.push(relative);
      }

      // Check for missing require/import targets
      const requireMatches = [...content.matchAll(/require\(['"](.+?)['"]\)/g)];
      const importMatches = [...content.matchAll(/from ['"](.+?)['"]/g)];

      const pathsToCheck = [
        ...requireMatches.map(m => m[1]),
        ...importMatches.map(m => m[1])
      ];

      for (const p of pathsToCheck) {
        const resolved = path.resolve(path.dirname(full), p);
        if (!fs.existsSync(resolved)) {
          report.missingTargets.push({
            loader: relative,
            missing: p
          });
        }
      }
    }

    // Detect malformed JSON
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

// Detect duplicate loader names
const loaderNames = report.misplacedLoaders.map(l => path.basename(l));
const duplicates = loaderNames.filter((v, i, a) => a.indexOf(v) !== i);
report.duplicateLoaders = duplicates;

report.summary = {
  totalLoaders: report.misplacedLoaders.length,
  oldSrcReferences: report.oldSrcReferences.length,
  missingTargets: report.missingTargets.length,
  duplicateLoaders: report.duplicateLoaders.length,
  malformedJson: report.malformedJson.length
};

console.log("===== Seven‑OS Repo Scan Report =====");
console.log(JSON.stringify(report, null, 2));
