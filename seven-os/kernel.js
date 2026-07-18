// Seven-OS Kernel Bootstrap
// Initializes routing, engines, workers, voice, missions, runtime, and stack.
// Adds OS Logic Integrity checks before runtime activation.

import { loadSectorWorkerMap } from "./system/loaders/sector-worker-loader.js";
import { loadIntegrationMap } from "./system/loaders/integration-loader.js";
import { loadSectorEngineBinding } from "./system/loaders/engine-binding-loader.js";
import integrityRules from "./system/integrity-rules.json" assert { type: "json" };

import { WorkerRouter } from "./seven-runtime/worker-router.js";
import { EngineRegistry } from "./seven-runtime/engine-registry.js";
import { VoiceSystem } from "./voice/voice-system.js";
import { MissionSystem } from "./missions/mission-system.js";

import { SevenRuntime } from "./runtime/seven-runtime.js";
import { SevenStack } from "./stack/seven-stack.js";

import { TelemetryLoop } from "./telemetry/telemetry-loop.js";
import { SafetyEnvelope } from "./safety/safety-envelope.js";

function assertIntegrity({ sectorWorkerMap, integrationMap, engineBinding }) {
  console.log("[Seven-OS] Running logic integrity checks...");

  // Routing integrity
  if (integrityRules.routing.requireSectorBinding && !engineBinding) {
    throw new Error("[Integrity] Missing sector → engine binding.");
  }
  if (integrityRules.routing.requireWorkerPattern && !sectorWorkerMap) {
    throw new Error("[Integrity] Missing sector → worker map.");
  }
  if (integrityRules.routing.requireIntegrationEvidence && !integrationMap) {
    throw new Error("[Integrity] Missing integration map.");
  }

  // Safety integrity
  if (integrityRules.safety.requireSafetyEnvelope) {
    console.log("[Integrity] Safety envelope required and will be initialized.");
  }

  // Voice integrity
  if (integrityRules.voice.requireIntentMapping) {
    console.log("[Integrity] Voice intent mapping required.");
  }

  // Mission integrity
  if (integrityRules.missions.requireSectorMissionProfile) {
    console.log("[Integrity] Sector mission profiles required.");
  }

  console.log("[Seven-OS] Logic integrity checks passed.");
}

export async function bootSevenOS() {
  console.log("[Seven-OS] Booting kernel...");

  // 1. Load routing maps
  const sectorWorkerMap = await loadSectorWorkerMap();
  const integrationMap = await loadIntegrationMap();
  const engineBinding = await loadSectorEngineBinding();

  // 1.5 Integrity check BEFORE runtime initialization
  assertIntegrity({ sectorWorkerMap, integrationMap, engineBinding });

  // 2. Initialize registries
  const workerRouter = new WorkerRouter(sectorWorkerMap, integrationMap);
  const engineRegistry = new EngineRegistry(engineBinding);

  // 3. Initialize voice + mission systems
  const voice = new VoiceSystem(workerRouter);
  const missions = new MissionSystem(workerRouter, engineRegistry);

  // 4. Initialize runtime + stack
  const runtime = new SevenRuntime(engineRegistry, missions);
  const stack = new SevenStack(runtime);

  // 5. Safety + telemetry
  const safety = new SafetyEnvelope(runtime);
  const telemetry = new TelemetryLoop(stack);

  console.log("[Seven-OS] Kernel boot complete.");
  return { workerRouter, engineRegistry, voice, missions, runtime, stack, safety, telemetry };
}

