// Seven‑OS Sovereign Router – V12 Alpha
// One Mind → Many Routes

import { loadAllEngines } from "./engine-loader.js";

export async function routeTask(task = {}, env = {}) {
    const engines = await loadAllEngines();

    const intent = task.intent || "unknown";
    const domain = task.domain || "general";
    const trust = task.trustZone || "public";

    //
    // 1. SYSTEM ROUTING
    //
    if (intent === "system" || domain === "system") {
        return runEngine("system-routing", task, env, engines);
    }

    //
    // 2. POLICY ROUTING
    //
    if (intent === "policy" || domain === "policy") {
        return runEngine("policy-engine", task, env, engines);
    }

    //
    // 3. AI ROUTING
    //
    if (intent === "ai" || domain === "ai") {
        return runEngine("ai-routing", task, env, engines);
    }

    //
    // 4. DOMAIN RUNTIME ROUTING
    //
    if (domain === "cattle") {
        return runEngine("cattle-runtime", task, env, engines);
    }

    if (domain === "drone") {
        return runEngine("drone-runtime", task, env, engines);
    }

    if (domain === "disaster") {
        return runEngine("disaster-runtime", task, env, engines);
    }

    if (domain === "infra") {
        return runEngine("infra-runtime", task, env, engines);
    }

    if (domain === "telecom") {
        return runEngine("telecom-runtime", task, env, engines);
    }

    if (domain === "safety") {
        return runEngine("safety-runtime", task, env, engines);
    }

    //
    // 5. FALLBACK → AI GENERAL ENGINE
    //
    return runEngine("ai-general", task, env, engines);
}

//
// Helper: run an engine by name
//
async function runEngine(name, task, env, engines) {
    const entry = engines[name];

    if (!entry) {
        return {
            ok: false,
            error: `Engine '${name}' not found`,
            task
        };
    }

    try {
        return await entry.module.run(task, env);
    } catch (err) {
        return {
            ok: false,
            error: `Engine '${name}' failed`,
            detail: err.message,
            task
        };
    }
}
