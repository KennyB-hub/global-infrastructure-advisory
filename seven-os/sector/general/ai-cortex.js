// Seven‑OS V12 Alpha — AI Cortex
// Central reasoning hub that orchestrates AI engines under autonomy + trustZone rules.

import { runEngine } from "../engine-runner.js"; // your generic engine executor
import { loadContext } from "../../system/context/context-loader.js"; // sector/route/user context

const ENGINE_MAP = {
  core: "CORE_ENGINE",
  geo: "GEO_ENGINE",
  design: "BLUEPRINT_ENGINE",
  document: "DOCUMENT_ENGINE",
  security: "SECURITY_ENGINE",
  math: "MATH_ENGINE",
  data: "DATA_ENGINE",
  science: "SCIENCE_ENGINE",
  geothermal: "GEOTHERMAL_ENGINE",
  renewables: "RENEWABLES_ENGINE",
  buildingCode: "BUILDING_CODE_ENGINE",
  zoning: "ZONING_ENGINE",
  sectorAnalysis: "SECTOR_ANALYSIS_ENGINE",
  engineering: "ENGINEERING_ENGINE",
  mechanics: "MECHANICS_ENGINE"
};

function resolveEngine(task) {
  const { sector, domain, intent } = task;

  // Simple but explicit routing logic; you can expand this over time.
  if (intent === "security" || sector === "defense") return ENGINE_MAP.security;
  if (intent === "mapping" || domain === "geo") return ENGINE_MAP.geo;
  if (intent === "design") return ENGINE_MAP.design;
  if (intent === "document") return ENGINE_MAP.document;
  if (intent === "math") return ENGINE_MAP.math;
  if (intent === "data") return ENGINE_MAP.data;
  if (intent === "science") return ENGINE_MAP.science;
  if (intent === "geothermal") return ENGINE_MAP.geothermal;
  if (intent === "renewables") return ENGINE_MAP.renewables;
  if (intent === "building-code") return ENGINE_MAP.buildingCode;
  if (intent === "zoning") return ENGINE_MAP.zoning;
  if (intent === "sector-analysis") return ENGINE_MAP.sectorAnalysis;
  if (intent === "engineering") return ENGINE_MAP.engineering;
  if (intent === "mechanics") return ENGINE_MAP.mechanics;

  // Default to core engine
  return ENGINE_MAP.core;
}

export async function runCortex(task) {
  // 1. Load rich context (sector, route, user, environment)
  const context = await loadContext(task);

  // 2. Resolve which engine should handle this task
  const engineId = resolveEngine({ ...task, ...context });

  // 3. Enforce autonomy + trustZone (you can wire this to your manifest later)
  const autonomyLevel = context.autonomyLevel ?? 2;
  const trustZone = context.trustZone ?? "system";

  // 4. Execute the selected engine via a generic runner
  const result = await runEngine({
    engineId,
    task,
    context,
    autonomyLevel,
    trustZone
  });

  // 5. Wrap in a sovereign response envelope
  return {
    ok: true,
    engineId,
    autonomyLevel,
    trustZone,
    contextSummary: {
      sector: context.sector,
      route: context.route,
      region: context.region
    },
    result
  };
}
