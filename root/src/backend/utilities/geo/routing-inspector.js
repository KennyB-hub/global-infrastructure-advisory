routing-inspector.js
export async function inspectRouting(target, cf) {
    try {
        const routes = await cf.getWorkerRoutes(target);
        return {
            target,
            count: routes.length,
            routes
        };
    } catch (err) {
        return { error: err.message };
    }
}
