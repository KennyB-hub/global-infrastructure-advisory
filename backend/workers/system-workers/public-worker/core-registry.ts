/**
 * Public Worker Registry Entry (TypeScript)
 * Seven‑OS Worker Registration Layer
 */

import { registerWorker } from "../../worker-registry";
import publicWorkerCapabilities, { PUBLIC_WORKER_ID } from "./index";

registerWorker({
  id: PUBLIC_WORKER_ID,
  file: "system-workers/public-worker/index.ts",
  roles: publicWorkerCapabilities.roles,
  capabilities: publicWorkerCapabilities,
  routes: publicWorkerCapabilities.workers,
});

export default PUBLIC_WORKER_ID;

