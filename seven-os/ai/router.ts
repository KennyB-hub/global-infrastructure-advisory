// autonomous/seven-os/ai/router.ts
// GIA Sovereign AI Router – V12 Alpha (TypeScript Version)

import { sovereignWorkerGuard } from "../../system/security/worker-guard.js";
import { validatePayload, validateTrustZone } from "./validator.js";
import { matchIntent } from "./ai-matching.js";
import { buildContext } from "./context-builder.js";
import { sanitizeOutput } from "./response-sanitizer.js";
import { handleError } from "./error-handler.js";
import { processUX } from "./unified-ux/unified-ux-core.js";

import * as organizerWorker from "../backend/workers/workers/organizer/index.js";
import * as expansionWorker from "../backend/workers/expansion/index.js";
import * as anysWorker from "../backend/workers/workers/anys/index.js";

import { createLoad, listLoads, updateLoadStatus } from "../load-registry.js";
import { matchHaulersForLoad } from "../load-matching-engine.js";

// Core engines
import { runGeoTask } from "./ai-geo.js";
import { runUtilityTask } from "./ai-utilities.js";
import { runDecisionEngine } from "./decision-engine.js";
import { runSandboxAI } from "./sandbox-bridge.js";
import { EngineeringEngine } from "./engineering-engine.js";
import { MechanicsEngine } from "./mechanics-engine.js";

// V12 Alpha engines
import { ScienceEngine } from "./science-engine.js";
import { GeothermalEngine } from "./geothermal-engine.js";
import { RenewablesEngine } from "./renewables-engine.js";
import { BuildingCodeEngine } from "./building-code-engine.js";
import { ZoningEngine } from "./zoning-engine.js";
import { SectorAnalysisEngine } from "./sector-analysis.js";
import { enforceAIPolicy } from "./ai-policy.js";

// Autonomous task management (Seven-of-Nine)
import { enqueueTask, getNextPendingTask, updateTask } from "./autonomous/task-queue.js";
import { getTaskHandler } from "./autonomous/task-registry.js";
import { runSevenOfNineOnce } from "./autonomous/seven-of-nine.js";

// ---- Type Definitions ----

export interface AIRequest {
  text?: string;
  trustZone?: string;
  workflow?: string;
  [key: string]: any; // flexible for engines
}

export interface AIEnv {
  [key: string]: any;
}

// ---- Engine Instances ----

const sectorAnalysisEngine = new SectorAnalysisEngine();
const scienceEngine = new ScienceEngine();
const geothermalEngine = new GeothermalEngine();
const renewablesEngine = new RenewablesEngine();
const buildingCodeEngine = new BuildingCodeEngine();
const zoningEngine = new ZoningEngine();
const engineeringEngine = new EngineeringEngine();
const mechanicsEngine = new MechanicsEngine();

// ---- Main Router ----

export async function processAIRequest(request: Request, env: AIEnv): Promise<Response> {
  try {
    // 1. Security guard
    const sec = sovereignWorkerGuard?.(request, env);
    if (sec) return sec;

    // 2. Parse JSON
    let input: AIRequest;
    try {
      input = await request.json();
    } catch {
      return handleError(new Error("Invalid JSON body"), env);
    }

    // 3. Validate base schema
    const schemaCheck = await validatePayload(env, input, {
      text: { required: false, type: "string" },
      trustZone: { required: false, type: "string" },
      workflow: { required: false, type: "string" }
    });
    if (!schemaCheck.ok) return schemaCheck;

    // 4. Trust-zone enforcement
    const zone = input.trustZone || "public";
    const trustCheck = await validateTrustZone(env, zone, 1);
    if (!trustCheck.ok) return trustCheck;

    if (input.workflow === "ux") {
      return await processUX(input);
    }

    // 5. Build sovereign context
    const context = await buildContext(input, env);

    // 6. Determine intent
    const intent = await matchIntent(input, context);
    const route = intent.intent;

    // 7. Route to correct engine
    let result: any;

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

      // ---- Cattle Logistics ----

      case "cattle-load-create":
        result = {
          ok: true,
          type: "cattle-load-create",
          load: createLoad({
            farmerName: input.farmerName,
            contactPhone: input.contactPhone,
            origin: input.origin,
            destination: input.destination,
            headCount: input.headCount,
            weightClass: input.weightClass,
            earliestPickup: input.earliestPickup,
            latestPickup: input.latestPickup,
            notes: input.notes
          })
        };
        break;

      case "cattle-load-match":
        result = {
          ok: true,
          type: "cattle-load-match",
          ...matchHaulersForLoad(input.loadId)
        };
        break;

      // ---- V12 Alpha Engines ----

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

      // ---- Autonomous Task Management ----

      case "task-enqueue":
        result = {
          ok: true,
          type: "task-enqueue",
          task: enqueueTask(input.taskType, input.payload)
        };
        break;

      case "task-status": {
        const fs = await import("fs");
        const path = await import("path");
        const queuePath = path.join(process.cwd(), "data/task-queue.json");

        let tasks: any[] = [];
        if (fs.existsSync(queuePath)) {
          tasks = JSON.parse(fs.readFileSync(queuePath, "utf8"));
        }

        const targetTask = input.taskId ? tasks.find(t => t.id === input.taskId) : null;

        result = {
          ok: true,
          type: "task-status",
          task: targetTask || null,
          allTasks: input.taskId ? undefined : tasks
        };
        break;
      }

      case "task-process":
        await runSevenOfNineOnce();
        result = {
          ok: true,
          type: "task-process",
          message: "Task processor executed (one cycle)"
        };
        break;

      case "task-list": {
        const fs = await import("fs");
        const path = await import("path");
        const queuePath = path.join(process.cwd(), "data/task-queue.json");

        let tasks: any[] = [];
        if (fs.existsSync(queuePath)) {
          tasks = JSON.parse(fs.readFileSync(queuePath, "utf8"));
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

    // 8. Sanitize output
    return sanitizeOutput(result, env, context);

  } catch (err: any) {
    return handleError(err, env, { fatal: true });
  }
}
