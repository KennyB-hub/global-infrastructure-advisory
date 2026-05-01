/**
 * inspectRouting.js
 * ------------------
 * Safe inspection of Cloudflare Workers routes.
 */

export async function inspectRouting(target, cf, ai) {
    if (!target) {
        return { error: "No target provided." };
    }

    let workerRoutes = [];
    let domainStatus = {};
    let trustStatus = {};
    let errors = [];

    // 1. Worker Routes
    try {
        const routes = await cf.getWorkerRoutes(target);
        workerRoutes = routes.map(r => ({
            pattern: r.pattern,
            script: r.script
        }));
    } catch (err) {
        errors.push("Worker route lookup failed: " + err.message);
    }

    // 2. AI Domain Readiness
    try {
        domainStatus = {
            contractor: typeof ai.domains.contractor === "function",
            farmer: typeof ai.domains.farmer === "function",
            public: typeof ai.domains.public === "function",
            infrastructure: typeof ai.domains.infrastructure === "function",
            gov: typeof ai.domains.gov === "function",
            deepgov: typeof ai.domains.deepgov === "function"
        };
    } catch (err) {
        errors.push("AI domain inspection failed: " + err.message);
    }

    // 3. Trust Zone Enforcement
    try {
        trustStatus = {
            public: "open",
            contractor: "auth-required",
            farmer: "auth-required",
            infrastructure: "restricted",
            gov: "restricted",
            deepgov: "sovereign-only"
        };
    } catch (err) {
        errors.push("Trust zone check failed: " + err.message);
    }

    return {
        target,
        workerRoutes,
        domainStatus,
        trustStatus,
        errors: errors.length ? errors : null
    };
}


