// proprietary-cli/loader/worker-router.js

import { loadWorkers } from "../../seven-os/engines/worker.js";

export async function buildWorkerRouter(options = {}) {
    const workers = await loadWorkers(options);

    const router = {};

    for (const [name, worker] of Object.entries(workers)) {
        if (typeof worker.route !== "string") continue;
        router[worker.route] = worker;
    }

    return router;
}
