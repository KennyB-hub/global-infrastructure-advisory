/**
 * inspectRouting.js
 * ------------------
 * Safe inspection of Cloudflare Workers routes.
 */

export async function inspectRouting(target, cf) {
    if (!target) {
        return { error: "No target provided." };
    }

    try {
        const routes = await cf.getWorkerRoutes(target);

        return {
            target,
            count: routes.length,
            routes: routes.map(r => ({
                pattern: r.pattern,
                script: r.script
            }))
        };
    } catch (err) {
        return { error: err.message };
    }
}

