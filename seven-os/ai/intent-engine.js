// seven-os/core/intent-engine.js
// Seven‑OS Sovereign Intent Engine – V12 Alpha

import { loadAllEngines } from "./engine-loader.js";

export async function resolveIntent(raw = {}, env = {}) {
  const text = raw.text || "";
  const hintDomain = raw.domain || null;
  const hintIntent = raw.intent || null;
  const trustZone = raw.trustZone || "public";

  const engines = await loadAllEngines();

  //
  // 1. If caller already provided intent/domain, respect it
  //
  if (hintIntent || hintDomain) {
    return {
      intent: hintIntent || inferIntentFromText(text),
      domain: hintDomain || inferDomainFromText(text),
      trustZone,
      task: raw
    };
  }

  //
  // 2. Infer domain from text
  //
  const domain = inferDomainFromText(text);

  //
  // 3. Infer intent from text
  //
  const intent = inferIntentFromText(text);

  //
  // 4. Optional: consult a dedicated intent engine if present
  //
  const intentEngine = engines["intent-engine"];
  if (intentEngine && intentEngine.module && typeof intentEngine.module.run === "function") {
    const result = await intentEngine.module.run(
      { text, domain, intent, trustZone, raw },
      env
    );

    if (result && result.intent && result.domain) {
      return {
        intent: result.intent,
        domain: result.domain,
        trustZone: result.trustZone || trustZone,
        task: raw
      };
    }
  }

  //
  // 5. Final resolved intent
  //
  return {
    intent,
    domain,
    trustZone,
    task: raw
  };
}

//
// Simple text‑based domain inference
//
function inferDomainFromText(text = "") {
  const t = text.toLowerCase();

  if (t.includes("cattle") || t.includes("collar") || t.includes("farm")) return "cattle";
  if (t.includes("drone") || t.includes("uav") || t.includes("flight")) return "drone";
  if (t.includes("disaster") || t.includes("evac") || t.includes("flood") || t.includes("wildfire")) return "disaster";
  if (t.includes("grid") || t.includes("power") || t.includes("infra") || t.includes("bridge")) return "infra";
  if (t.includes("telecom") || t.includes("fcc") || t.includes("spectrum")) return "telecom";
  if (t.includes("safety") || t.includes("osha") || t.includes("incident")) return "safety";
  if (t.includes("policy") || t.includes("regulation") || t.includes("law")) return "policy";
  if (t.includes("system") || t.includes("routing") || t.includes("kernel")) return "system";

  return "ai"; // default: general AI / advisory
}

//
// Simple text‑based intent inference
//
function inferIntentFromText(text = "") {
  const t = text.toLowerCase();

  if (t.includes("status") || t.includes("health") || t.includes("uptime")) return "system";
  if (t.includes("route") || t.includes("path") || t.includes("plan")) return "ai";
  if (t.includes("policy") || t.includes("regulation") || t.includes("compliance")) return "policy";
  if (t.includes("simulate") || t.includes("scenario") || t.includes("model")) return "ai";
  if (t.includes("runtime") || t.includes("execute") || t.includes("run mission")) return "runtime";

  return "ai"; // default advisory / reasoning
}
