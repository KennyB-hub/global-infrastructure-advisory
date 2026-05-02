routing-inspector.js
export async function inspectRouting(target, cf, ai) {
    let workerRoutes = [];
    let domainStatus = {};
    let trustStatus = {};
    let errors = [];

    try {
        const routes = await cf.getWorkerRoutes(target);
        workerRoutes = routes.map(r => ({
            pattern: r.pattern,
            script: r.script
        }));
    } catch (err) {
        errors.push("Worker route lookup failed: " + err.message);
    }

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

    trustStatus = {
        public: "open",
        contractor: "auth-required",
        farmer: "auth-required",
        infrastructure: "restricted",
        gov: "restricted",
        deepgov: "sovereign-only"
    };

    return {
        target,
        workerRoutes,
        domainStatus,
        trustStatus,
        errors: errors.length ? errors : null
    };
}
