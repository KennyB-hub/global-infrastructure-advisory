import fs from "fs";
import path from "path";

// 1. Core Native Infrastructure Tracks (Your Master Sectors)
const BASE_TRACKS = [
  { id: "grid-pipeline", label: "Energy & Utilities Infrastructure", sector: "energy" },
  { id: "telecom-pipeline", label: "FCC Telecommunications Links", sector: "telecom" },
  { id: "transit-pipeline", label: "DOT Roads & Transit Networks", sector: "transit" },
  { id: "avionics-pipeline", label: "UAS Drone Controls & Telemetry", sector: "avionics" }
];

// 2. Dynamic Discovery & Governance Engine for Global Autonomy Level 3
function discoverRuntimeTracks() {
  const root = process.cwd();
  const matrixPath = path.join(root, "reports", "unmapped-matrix.json");
  const discoveredTracks = [...BASE_TRACKS];

  try {
    if (fs.existsSync(matrixPath)) {
      const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
      if (matrix && matrix.sectors) {
        const baseSectors = new Set(BASE_TRACKS.map(t => t.sector));
        
        Object.keys(matrix.sectors).forEach(folderPath => {
          const parts = folderPath.split("/");
          const sectorName = (parts[parts.length - 1] || folderPath).toLowerCase();
          
          // Filter out internal dashboard system components to prevent noise
          const isSystemInternal = ["layouts", "widgets", "themes", "root"].includes(sectorName);
          
          if (sectorName && !baseSectors.has(sectorName) && !isSystemInternal) {
            discoveredTracks.push({
              id: `${sectorName}-pipeline`,
              label: `${sectorName.toUpperCase()} Discovered System Track`,
              sector: sectorName
            });
            // Prevent duplicate injections
            baseSectors.add(sectorName);
          }
        });
      }
    }
  } catch (err) {
    // Failsafe: fall back gracefully to base tracks if reports are locked during active runtime write
  }
  return discoveredTracks;
}

// 3. Consolidated Sovereign Operational Matrix
export const jobsWorkflowPipeline = {
  id: "workforce-orchestration-matrix",
  name: "Global Infrastructure Workforce Pipeline",
  autonomyLevel: 3,
  systemSector: "application",
  uiBucket: {
    enabled: true,
    dashboardId: "universal-infrastructure-dashboard",
    refreshIntervalMs: 500
  },
  // Executes dynamic discovery to capture newly generated real-world infrastructure loops
  get tracks() {
    return discoverRuntimeTracks();
  },
  rules: {
    preventCollisions: true,
    autoAlignPaths: true,
    isolateDependencyBlocks: true,
    dynamicGovernanceAudit: true
  },
  // 4. Strict Government, IRS, FCC & Regulatory Governance Layer
  governanceMatrix: {
    complianceMode: "strict-enforcement",
    auditors: ["IRS", "DOT", "FCC", "FINANCIAL-GOV"],
    retentionRules: {
      ledgerLogsYears: 7,
      immutableRoutes: true
    },
    getSectorMandate(sector: string) {
      const mandates: Record<string, string> = {
        energy: "FERC/NERC Grid Resilience & Critical Infrastructure Isolation Mandate",
        telecom: "FCC Title 47 - Communications Infrastructure Compliance Safeguards",
        transit: "DOT Title 49 - Transit Control System Operational Traceability Rule",
        avionics: "FAA Part 107 / Autonomous Flight System Operations Continuous Audit",
        financial: "IRS Section 6001 - Continuous Financial Account Audit Tracking ledger"
      };
      return mandates[sector.toLowerCase()] || "Sovereign Framework Control - Internal Governance Standard";
    }
  }
};