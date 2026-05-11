// risk-trend-analytics-engine.js
// V12 Alpha – Risk Trend Analytics Engine

const fs = require("fs");
const path = require("path");

const HISTORY_DIR = path.join(process.cwd(), "logs/template-history");

/**
 * Load all history entries.
 */
function loadHistory() {
  if (!fs.existsSync(HISTORY_DIR)) return [];
  const files = fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith(".json"));

  return files.map((file) => {
    const full = path.join(HISTORY_DIR, file);
    return JSON.parse(fs.readFileSync(full, "utf8"));
  });
}

/**
 * Compute rolling average for risk scores.
 */
function rollingAverage(values, windowSize = 5) {
  const result = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1);
    const avg = window.reduce((a, b) => a + b, 0) / window.length;
    result.push(avg);
  }
  return result;
}

/**
 * Compute slope (trend direction).
 */
function computeSlope(values) {
  if (values.length < 2) return 0;
  return values[values.length - 1] - values[0];
}

/**
 * Analyze risk trends across history.
 */
function analyzeRiskTrends() {
  const history = loadHistory();

  const riskTimeline = [];
  const trustZoneChanges = {};
  const sectorRisk = {};
  const templateRisk = {};

  history.forEach((entry) => {
    const { diff, metadata, timestamp } = entry;

    const risk = diff?.riskScore || metadata?.riskScore || null;
    if (risk !== null) {
      riskTimeline.push({ timestamp, risk });
    }

    // Track trustZone drift
    const tz = metadata?.trustZone;
    if (tz) {
      trustZoneChanges[tz] = (trustZoneChanges[tz] || 0) + 1;
    }

    // Track sector risk
    const sector = metadata?.sector;
    if (sector && risk !== null) {
      sectorRisk[sector] = sectorRisk[sector] || [];
      sectorRisk[sector].push(risk);
    }

    // Track template-specific risk evolution
    const templateId = entry.to;
    if (templateId && risk !== null) {
      templateRisk[templateId] = templateRisk[templateId] || [];
      templateRisk[templateId].push(risk);
    }
  });

  // Compute rolling averages
  const riskValues = riskTimeline.map((r) => r.risk);
  const rolling = rollingAverage(riskValues, 5);

  return {
    totals: {
      historyEntries: history.length,
      trackedRiskPoints: riskValues.length
    },
    overallRiskTrend: {
      slope: computeSlope(riskValues),
      rollingAverage: rolling
    },
    trustZoneDrift: trustZoneChanges,
    sectorRiskTrends: Object.fromEntries(
      Object.entries(sectorRisk).map(([sector, values]) => [
        sector,
        {
          average: values.reduce((a, b) => a + b, 0) / values.length,
          slope: computeSlope(values)
        }
      ])
    ),
    templateRiskTrends: Object.fromEntries(
      Object.entries(templateRisk).map(([id, values]) => [
        id,
        {
          latest: values[values.length - 1],
          slope: computeSlope(values)
        }
      ])
    )
  };
}

module.exports = {
  analyzeRiskTrends
};
