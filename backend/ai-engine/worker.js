worker.js
import { systemThreatReport } from "../../backend/system/threat-report.js";

const START_TIME = Date.now();

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === "/system/threat-report") {
            const report = await systemThreatReport(env);
            return new Response(JSON.stringify(report, null, 2), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        // ...existing routes...
        return new Response("Not found", { status: 404 });
    }
};

