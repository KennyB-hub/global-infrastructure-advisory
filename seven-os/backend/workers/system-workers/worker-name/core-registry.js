const { registerWorker } = require("../../worker-registry");
const capabilities = require("./index");

registerWorker({
  id: capabilities.id,
  file: "system-workers/<worker-name>/index.js",
  roles: capabilities.roles,
  capabilities,
  routes: capabilities.workers || capabilities.routes,
});
