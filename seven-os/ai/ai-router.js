// seven-os/engine/ai-router.js
// GIA Sovereign AI Router – V12 Alpha

import { sovereignWorkerGuard } from "../system/security/worker-guard.js";
import { validatePayload, validateTrustZone } from "./validator.js";
import { matchIntent } from "./ai-matching.js";
import { buildContext } from "../engines/context-builder.js";
import { sanitizeOutput } from "../engines/response-sanitizer.js";
import { handleError } from "../engines/error-handler.js";
import { processUX } from "./unified-ux/unified-ux-core.js";
import * as organizerWorker from "../workers/organizer/index.js";
import * as expansionWorker from "../workers/expansion/index.js";
import * as anysWorker from "../workers/anys/index.js";

import { createLoad, listLoads, updateLoadStatus } from "../load-registry.js";
import { matchHaulersForLoad } from "../load-matching-engine.js";

// Core engines
import { runGeoTask } from "../engines/ai-geo.js";
import { runUtilityTask } from "../engines/ai-utilities.js";
import { runDecisionEngine } from "../engines/decision-engine.js";
import { runSandboxAI } from "../engines/sandbox-bridge.js";
import { EngineeringEngine } from "../engines/engineering-engine.js";
import { MechanicsEngine } from "../engines/mechanics-engine.js";

// New V12 Alpha engines
import { ScienceEngine } from "../engines/science-engine.js";
import { GeothermalEngine } from "../engines/geothermal-engine.js";
import { RenewablesEngine } from "../engines/renewables-engine.js";
import { BuildingCodeEngine } from "../engines/building-code-engine.js";
import { ZoningEngine } from "../engines/zoning-engine.js";
import { SectorAnalysisEngine } from "./sector-analysis.js";
import { enforceAIPolicy } from "./ai-policy.js";

// Autonomous task management (Seven-of-Nine)
import { enqueueTask, getNextPendingTask, updateTask } from "./autonomous/task-queue.js";
import { getTaskHandler } from "./autonomous/task-registry.js";
import { runSevenOfNineOnce } from "./autonomous/seven-of-nine.js";
import { loadDynamicEngines } from "../engines/dynamic-engine-loader.js";
import { routeMissionWithPhoenix } from "../financial/engine.js";

const sectorAnalysisEngine = new SectorAnalysisEngine();
const scienceEngine = new ScienceEngine();
const geothermalEngine = new GeothermalEngine();
const renewablesEngine = new RenewablesEngine();
const buildingCodeEngine = new BuildingCodeEngine();
const zoningEngine = new ZoningEngine();
const engineeringEngine = new EngineeringEngine();
const mechanicsEngine = new MechanicsEngine();
const dynamicEngines = loadDynamicEngines("./");

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

    // --- Dynamic Engine Routing (auto-discovery) ---
    if (dynamicEngines[route + "-engine"]) {
    result = await dynamicEngines[route + "-engine"].process(input, env, context);
    return sanitizeOutput(result, env, context);
}

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

      case "mission":
        result = await routeMissionWithPhoenix(input);
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

      case "organizer":
        result = await organizerWorker.process(input, env, context);
        break;

      case "expansion":
        result = await expansionWorker.process(input, env, context);
        break;

      case "anys":
        result = await anysWorker.process(input, env, context);
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

      // --- Autonomous Task Management (Seven-of-Nine) ---

      case "task-enqueue": {
        const task = enqueueTask(input.taskType, input.payload);
        result = {
          ok: true,
          type: "task-enqueue",
          task
        };
        break;
      }

      case "task-status": {
        const taskId = input.taskId;
        let tasks = [];
        try {
          // Load tasks to find specific task or all tasks
          const fs = await import("fs");
          const path = await import("path");
          const queuePath = path.join(process.cwd(), "data/task-queue.json");
          if (fs.existsSync(queuePath)) {
            tasks = JSON.parse(fs.readFileSync(queuePath, "utf8"));
          }
        } catch {
          tasks = [];
        }
        
        const targetTask = taskId ? tasks.find(t => t.id === taskId) : null;
        result = {
          ok: true,
          type: "task-status",
          task: targetTask || null,
          allTasks: taskId ? undefined : tasks
        };
        break;
      }

      case "task-process": {
        // Manually trigger Seven-of-Nine to process next pending task
        await runSevenOfNineOnce();
        result = {
          ok: true,
          type: "task-process",
          message: "Task processor executed (one cycle)"
        };
        break;
      }

      case "task-list": {
        let tasks = [];
        try {
          const fs = await import("fs");
          const path = await import("path");
          const queuePath = path.join(process.cwd(), "data/task-queue.json");
          if (fs.existsSync(queuePath)) {
            tasks = JSON.parse(fs.readFileSync(queuePath, "utf8"));
          }
        } catch {
          tasks = [];
        }
        
        const filter = input.status || null;
        const filtered = filter ? tasks.filter(t => t.status === filter) : tasks;
        
        result = {
          ok: true,
          type: "task-list",
          tasks: filtered,
          total: filtered.length
        };
        break;
      }

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
