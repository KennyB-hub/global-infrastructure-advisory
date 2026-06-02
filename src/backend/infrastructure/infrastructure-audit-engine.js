import { ingestDOT } from "./ingestion/dot-ingest.js";
import { ingestFCC } from "./ingestion/fcc-ingest.js";
import { ingestUSDA } from "./ingestion/usda-ingest.js";
import { ingestSensors } from "./ingestion/sensor-ingest.js";

import { detectRoadHazards } from "./hazards/road-hazards.js";
import { detectTowerHazards } from "./hazards/tower-hazards.js";
import { detectBridgeHazards } from "./hazards/bridge-hazards.js";

import { scoreSector } from "./scoring/sector-scoring.js";

import { checkFunding } from "./compliance/funding-check.js";
import { checkContractors } from "./compliance/contractor-check.js";
import { checkMisconduct } from "./compliance/misconduct-check.js";

import { generateAuditReport } from "./reports/audit-generator.js";
import { generateModernizationPlan } from "./reports/modernization-plan.js";
import { generateGISOverlay } from "./reports/gis-overlay.js";

import { analyzeFunding } from "../economics/funding-engine.js";
import { matchContractors } from "../economics/contractor-matching.js";

export const InfrastructureAuditEngine = {
  async runAudit(target, options = {}) {
    const dot = await ingestDOT(target);
    const fcc = await ingestFCC(target);
    const usda = await ingestUSDA(target);
    const sensors = await ingestSensors(target);

    const data = { dot, fcc, usda, sensors };

    const hazards = [
      ...detectRoadHazards(data),
      ...detectTowerHazards(data),
      ...detectBridgeHazards(data)
    ];

    const score = scoreSector(data, hazards);

    const compliance = {
      funding: checkFunding(data),
      contractors: checkContractors(data),
      misconduct: checkMisconduct(data)
    };

    const funding = analyzeFunding(data);
    const contractorMatches = matchContractors(target, options.requirements || {});
    const modernizationPlan = generateModernizationPlan(data, hazards, score);
    const gisOverlay = generateGISOverlay(data, hazards);

    return generateAuditReport({
      target,
      data,
      hazards,
      score,
      compliance,
      funding,
      contractorMatches,
      modernizationPlan,
      gisOverlay
    });
  }
};
