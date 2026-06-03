import { CyberThreatModels } from "./cyber-models.js";
import { ThreatFetch } from "./threat-fetch.js";
import { ThreatStorage } from "./threat-storage.js";
import { ThreatSummary } from "./threat-summary.js";
import { ThreatTelemetry } from "./threat-telemetry.js";
import { ThreatReporting } from "./threat-reporting.js";
import { ThreatEngine } from "./threat-engine.js";

export const Threat = {
  Models: {
    Cyber: CyberThreatModels
  },

  Fetch: ThreatFetch,
  Storage: ThreatStorage,
  Summary: ThreatSummary,
  Telemetry: ThreatTelemetry,
  Reporting: ThreatReporting,
  Engine: ThreatEngine
};
