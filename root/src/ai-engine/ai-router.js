// src/ai-engine/ai-router.js
// GIA Sovereign AI Router – V12 Alpha

import { sovereignWorkerGuard } from "../system/security/worker-guard.js";
import { validatePayload, validateTrustZone } from "./validator.js";
import { matchIntent } from "./ai-matching.js";
import { buildContext } from "./context-builder.js";
import { sanitizeOutput } from "./response-sanitizer.js";
import { handleError } from "./error-handler.js";
import { processUX } from "./unified-ux/unified-ux-core.js";

import { createLoad, listLoads, updateLoadStatus } from "../ai/load-registry.js";
import { matchHaulersForLoad } from "../ai/load-matching-engine.js";

// Core engines
import { runGeoTask } from "./ai-geo.js";
import { runUtilityTask } from "./ai-utilities.js";
import { runDecisionEngine } from "./decision-engine.js";
import { runSandboxAI } from "./sandbox-bridge.js";
import { EngineeringEngine } from "./engineering-engine.js";
import { MechanicsEngine } from "./mechanics-engine.js";

// New V12 Alpha engines
import { ScienceEngine } from "./science-engine.js";
import { GeothermalEngine } from "./geothermal-engine.js";
import { RenewablesEngine } from "./renewables-engine.js";
import { BuildingCodeEngine } from "./building-code-engine.js";
import { ZoningEngine } from "./zoning-engine.js";
import { SectorAnalysisEngine } from "./sector-analysis.js";
import { enforceAIPolicy } from "./ai-policy.js";

const sectorAnalysisEngine = new SectorAnalysisEngine();
const scienceEngine = new ScienceEngine();
const geothermalEngine = new GeothermalEngine();
const renewablesEngine = new RenewablesEngine();
const buildingCodeEngine = new BuildingCodeEngine();
const zoningEngine = new ZoningEngine();
const engineeringEngine = new EngineeringEngine();
const mechanicsEngine = new MechanicsEngine();

export async function processAIRequest(request, env) {
  try {
    //
    // 1. Security guard
    //
    const sec = sovereignWorkerGuard?.(request, env);
    if (sec) return sec;

    //
    // 2. Parse JSON
    //
    let input;
    try {
      input = await request.json();
    } catch {
      return handleError(new Error("Invalid JSON body"), env);
    }

    //
    // 3. Validate base schema
    //
    const schemaCheck = await validatePayload(env, input, {
      text: { required: false, type: "string" },
      trustZone: { required: false, type: "string" },
      workflow: { required: false, type: "string" }
    });
    if (!schemaCheck.ok) return schemaCheck;

    //
    // 4. Trust‑zone enforcement
    //
    const zone = input.trustZone || "public";
    const trustCheck = await validateTrustZone(env, zone, 1);
    if (!trustCheck.ok) return trustCheck;
    
    if (input.workflow === "ux") {
  return await processUX(input);
}

    //
    // 5. Build sovereign context
    //
    const context = await buildContext(input, env);

    //
    // 6. Determine intent
    //
    const intent = await matchIntent(input, context);
    const route = intent.intent;

    //
    // 7. Route to correct engine
    //
    let result;

    switch (route) {
      case "geo":
        result = await runGeoTask(input, env, context);
        break;

      case "utility":
        result = await runUtilityTask(input, env, context);
        break;

      case "decision":
        result = await runDecisionEngine(input, env, context);
        break;

      case "sandbox":
        result = await runSandboxAI(input, env, context);
        break;

      // --- NEW: Cattle logistics intents ---

      case "cattle-load-create": {
        const load = createLoad({
          farmerName: input.farmerName,
          contactPhone: input.contactPhone,
          origin: input.origin,
          destination: input.destination,
          headCount: input.headCount,
          weightClass: input.weightClass,
          earliestPickup: input.earliestPickup,
          latestPickup: input.latestPickup,
          notes: input.notes
        });
        result = {
          ok: true,
          type: "cattle-load-create",
          load
        };
        break;
      }

      case "cattle-load-match": {
        const loadId = input.loadId;
        const matchResult = matchHaulersForLoad(loadId);
        result = {
          ok: true,
          type: "cattle-load-match",
          ...matchResult
        };
        break;
      }

      // --- V12 Alpha Engines ---

      case "science":
        result = await scienceEngine.process(input, env, context);
        break;

      case "engineering-analysis":
        result = await engineeringEngine.process(input, env, context);
        break;

      case "mechanics-analysis":
        result = await mechanicsEngine.process(input, env, context);
        break;

      case "geothermal":
        result = await geothermalEngine.process(input, env, context);
        break;

      case "renewables":
      case "solar":
      case "wind":
        result = await renewablesEngine.process(input, env, context);
        break;

      case "building-code":
        result = await buildingCodeEngine.process(input, env, context);
        break;

      case "zoning":
        result = await zoningEngine.process(input, env, context);
        break;

      case "sector-analysis":
        result = await sectorAnalysisEngine.process(input, env, context);
        break;

      default:
        result = {
          ok: true,
          type: "general",
          content: "General AI processing path",
          meta: { route }
        };
    }

    //
    // 8. Sanitize output
    //
    return sanitizeOutput(result, env, context);

  } catch (err) {
    return handleError(err, env, { fatal: true });
  }
}
