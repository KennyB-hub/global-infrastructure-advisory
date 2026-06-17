import { registerWorker } from "../../worker-registry";
import capabilities from "./index";

registerWorker({
  id: capabilities.id,
  file: "system-workers/<worker-name>/index.ts",
  roles: capabilities.roles,
  capabilities,
  routes: capabilities.workers || capabilities.routes,
});
