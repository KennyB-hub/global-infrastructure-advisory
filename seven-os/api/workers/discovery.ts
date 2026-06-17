/**
 * Worker Discovery API (TypeScript)
 * Seven‑OS System Discovery Endpoint
 */

import { listWorkers, listWorkerStates } from "../../workers/worker-registry";

export default {
  async fetch(request: Request): Promise<Response> {
    const workers = listWorkers();
    const states = listWorkerStates();

    const response = workers.map(worker => ({
      id: worker.id,
      file: worker.file,
      roles: worker.roles,
      capabilities: worker.capabilities,
      routes: worker.routes,
      state: states.find(s => s.id === worker.id) || null,
    }));

    return new Response(JSON.stringify(response, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
