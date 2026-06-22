/**
 * Public Worker Registry Entry (JavaScript)
 * Seven‑OS Worker Registration Layer
 */

const { registerWorker } = require("../../worker-registry");
const publicWorkerCapabilities = require("./index");
const PUBLIC_WORKER_ID = "public-worker";

registerWorker({
  id: PUBLIC_WORKER_ID,
  file: "system-workers/public-worker/index.js",
  roles: publicWorkerCapabilities.roles,
  capabilities: publicWorkerCapabilities,
  routes: publicWorkerCapabilities.workers,
});

module.exports = PUBLIC_WORKER_ID;
