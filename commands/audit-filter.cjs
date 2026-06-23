// commands/audit-filter.cjs
// Seven‑OS Audit Filter — Filters npm audit results for real, reachable threats.

const { spawnSync } = require("child_process");
const { writeReport } = require("../utilities/write-report.cjs");

const NON_REACHABLE_PACKAGES = [
  "mocha",
  "diff",
  "minimatch",
  "serialize-javascript",
  "nanoid",
  "js-yaml",
  "wrangler",
  "miniflare",
  "esbuild",
  "ws",
  "undici"
];

function runAuditRaw() {
  const result = spawnSync("npm", ["audit", "--json"], {
    encoding: "utf8",
    shell: true
  });

  if (!result.stdout) {
    console.error("❌ Failed to run npm audit");
    process.exit(1);
  }

  return JSON.parse(result.stdout);
}

function filterVulnerabilities(auditJson) {
  const filtered = [];

  for (const [id, vuln] of Object.entries(auditJson.vulnerabilities || {})) {
    const pkg = vuln.name;

    // Skip packages that Seven‑OS never executes directly
    if (NON_REACHABLE_PACKAGES.includes(pkg)) {
      continue;
    }

    // Skip dev-only dependencies
    if (vuln.dev === true) {
      continue;
    }

    // Skip vulnerabilities in build tools
    if (vuln.via && vuln.via.some(v => typeof v === "string" && NON_REACHABLE_PACKAGES.includes(v))) {
      continue;
    }

    // If it reaches here, it's a real threat
    filtered.push({
      id,
      package: pkg,
      severity: vuln.severity,
      via: vuln.via,
      paths: vuln.via,
      title: vuln.title
    });
  }

  return filtered;
}

function run() {
  console.log("\n🔍 Seven‑OS Audit Filter — Sovereign Threat Reduction\n");

  const raw = runAuditRaw();
  const filtered = filterVulnerabilities(raw);

  console.log(`Found ${filtered.length} real vulnerabilities after filtering.`);

  writeReport("audit-filter", {
    timestamp: new Date().toISOString(),
    total: Object.keys(raw.vulnerabilities || {}).length,
    filtered: filtered.length,
    vulnerabilities: filtered
  });

  console.log("\n✨ Audit filter complete.\n");
}

run();
